#!/usr/bin/env node
/**
 * backup-db.js — Manual MongoDB Atlas backup (pure Node.js, no mongodump needed)
 *
 * Usage:
 *   node backend/scripts/backup-db.js                      # backup to local JSON files
 *   node backend/scripts/backup-db.js --push-to-atlas      # backup + push snapshot to Atlas
 *   node backend/scripts/backup-db.js --atlas-only         # push to Atlas only (skip local files)
 *   node backend/scripts/backup-db.js --collections users,companies,jobs
 *   node backend/scripts/backup-db.js --out ./my-backups
 *
 * Local output:
 *   backups/
 *   └── 2026-03-24T14-30-00/
 *       ├── manifest.json          (metadata: date, DB name, collections, counts)
 *       ├── users.json
 *       ├── companies.json
 *       ├── jobs.json
 *       └── ...
 *
 * Atlas output (database: japansswdb_backups):
 *   Collection _sessions   → one manifest doc per backup run
 *   Collection <name>      → docs chunked into 1 000-doc pages stored as
 *                            { session, collection, chunk, docs: [...] }
 *
 * npm scripts:
 *   cd backend && npm run backup                # local JSON only
 *   cd backend && npm run backup:atlas          # local + push to Atlas
 *   cd backend && npm run backup:atlas-only     # Atlas only
 */

"use strict";
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const outRoot = getArg("--out") || path.join(__dirname, "..", "..", "backups");
const onlyArg = getArg("--collections");
const filterCollections = onlyArg ? onlyArg.split(",").map((s) => s.trim()) : null;
const pushToAtlas = hasFlag("--push-to-atlas") || hasFlag("--atlas-only");
const atlasOnly   = hasFlag("--atlas-only");

const BACKUP_DB_NAME = "japansswdb_backups"; // separate Atlas DB for snapshots
const CHUNK_SIZE     = 1000;                  // docs per Atlas chunk doc (stays well under 16 MB)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timestamp() {
  return new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set. Add it to backend/.env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB Atlas…");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const sourceDb = mongoose.connection.db;
  const dbName   = sourceDb.databaseName;
  console.log(`✅  Connected — database: ${dbName}`);

  // Discover collections
  const allCollections = (await sourceDb.listCollections().toArray()).map((c) => c.name).sort();
  const collections = filterCollections
    ? allCollections.filter((c) => filterCollections.includes(c))
    : allCollections;

  if (collections.length === 0) {
    console.warn("⚠️   No matching collections found.");
    await mongoose.disconnect();
    return;
  }

  // ── Read all docs ──────────────────────────────────────────────────────────
  const ts = timestamp();
  const collectionData = {};
  let totalDocs = 0;

  console.log(`\n📖  Reading ${collections.length} collections…\n`);
  for (const name of collections) {
    process.stdout.write(`  → ${name.padEnd(30, " ")} `);
    try {
      const docs = await sourceDb.collection(name).find({}).toArray();
      collectionData[name] = docs;
      totalDocs += docs.length;
      console.log(`${docs.length} docs`);
    } catch (err) {
      collectionData[name] = [];
      console.log(`ERROR: ${err.message}`);
    }
  }

  // Record who/what triggered this run
  const npmEvent = process.env.npm_lifecycle_event || null;
  const command = process.argv.join(" ");
  const triggeredBy = process.env.USER || process.env.LOGNAME || (os.userInfo && os.userInfo().username) || "unknown";

  const manifest = {
    session:     ts,
    createdAt:   new Date().toISOString(),
    database:    dbName,
    uri:         process.env.MONGODB_URI.replace(/:\/\/[^@]+@/, "://<credentials>@"),
    triggeredBy: triggeredBy,
    triggeredVia: npmEvent ? `npm:${npmEvent}` : "direct",
    command: command,
    cwd: process.cwd(),
    pid: process.pid,
    collections: {},
  };

  for (const name of collections) {
    manifest.collections[name] = { count: collectionData[name].length, file: `${name}.json` };
  }

  // Append a short JSONL log entry to backups/backup.log for quick audit
  try {
    ensureDir(outRoot);
    const auditLogPath = path.join(outRoot, "backup.log");
    const logEntry = {
      session: ts,
      createdAt: manifest.createdAt,
      triggeredBy: manifest.triggeredBy,
      triggeredVia: manifest.triggeredVia,
      command: manifest.command,
      cwd: manifest.cwd,
      pid: manifest.pid,
      collections: Object.keys(manifest.collections).length,
      totalDocs
    };
    fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + "\n", "utf8");
  } catch (err) {
    // non-fatal: continue even if logging fails
    console.warn("⚠️  Could not write audit log:", err.message);
  }

  // ── 1. Write local JSON files ──────────────────────────────────────────────
  if (!atlasOnly) {
    const backupDir = path.join(outRoot, ts);
    ensureDir(backupDir);
    console.log(`\n💾  Writing local backup → ${backupDir}\n`);

    for (const name of collections) {
      fs.writeFileSync(
        path.join(backupDir, `${name}.json`),
        JSON.stringify(collectionData[name], null, 2),
        "utf8"
      );
    }
    fs.writeFileSync(
      path.join(backupDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );
    console.log(`✅  Local backup complete!`);
    console.log(`   Collections : ${collections.length}`);
    console.log(`   Total docs  : ${totalDocs}`);
    console.log(`   Location    : ${backupDir}`);
  }

  // ── 2. Push snapshot to Atlas (japansswdb_backups) ─────────────────────────
  if (pushToAtlas) {
    console.log(`\n☁️   Pushing snapshot to Atlas (database: ${BACKUP_DB_NAME})…\n`);
    const backupDb = sourceDb.client.db(BACKUP_DB_NAME);

    // Write manifest to _sessions collection
    await backupDb.collection("_sessions").insertOne({
      ...manifest,
      totalDocs,
    });

    let chunksWritten = 0;

    for (const name of collections) {
      const docs = collectionData[name];
      if (docs.length === 0) continue;

      process.stdout.write(`  → ${name.padEnd(30, " ")} `);
      const chunks = [];
      for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
        chunks.push({
          session:    ts,
          collection: name,
          chunk:      Math.floor(i / CHUNK_SIZE),
          totalChunks: Math.ceil(docs.length / CHUNK_SIZE),
          count:      Math.min(CHUNK_SIZE, docs.length - i),
          docs:       docs.slice(i, i + CHUNK_SIZE),
        });
      }
      await backupDb.collection(name).insertMany(chunks);
      chunksWritten += chunks.length;
      console.log(`${docs.length} docs (${chunks.length} chunk${chunks.length > 1 ? "s" : ""})`);
    }

    // Create index on session field for fast lookup/restore
    await backupDb.collection("_sessions").createIndex({ session: 1 });
    for (const name of collections) {
      if (collectionData[name].length > 0) {
        await backupDb.collection(name).createIndex({ session: 1 });
      }
    }

    console.log(`\n✅  Atlas snapshot complete!`);
    console.log(`   Session     : ${ts}`);
    console.log(`   Collections : ${collections.length}`);
    console.log(`   Total docs  : ${totalDocs}`);
    console.log(`   Atlas DB    : ${BACKUP_DB_NAME}`);
    console.log(`\n   To restore from this Atlas snapshot:`);
    console.log(`   npm run restore:atlas -- --session ${ts}`);
  }

  console.log();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Backup failed:", err.message);
  process.exit(1);
});
