#!/usr/bin/env node
/**
 * backup-db.js — Manual MongoDB Atlas backup (pure Node.js, no mongodump needed)
 *
 * Usage:
 *   node backend/scripts/backup-db.js                  # backup all collections
 *   node backend/scripts/backup-db.js --collections users,companies,jobs
 *   node backend/scripts/backup-db.js --out ./my-backups
 *
 * Output:
 *   backups/
 *   └── 2026-03-24T14-30-00/
 *       ├── manifest.json          (metadata: date, DB name, collections, counts)
 *       ├── users.json
 *       ├── companies.json
 *       ├── jobs.json
 *       └── ...
 *
 * npm script:  cd backend && npm run backup
 */

"use strict";
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const outRoot = getArg("--out") || path.join(__dirname, "..", "..", "backups");
const onlyArg = getArg("--collections");
const filterCollections = onlyArg ? onlyArg.split(",").map((s) => s.trim()) : null;

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
  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  console.log(`✅  Connected — database: ${dbName}`);

  // Discover all collections
  const allCollections = (await db.listCollections().toArray()).map((c) => c.name).sort();
  const collections = filterCollections
    ? allCollections.filter((c) => filterCollections.includes(c))
    : allCollections;

  if (collections.length === 0) {
    console.warn("⚠️   No matching collections found.");
    await mongoose.disconnect();
    return;
  }

  // Create timestamped output directory
  const backupDir = path.join(outRoot, timestamp());
  ensureDir(backupDir);

  console.log(`\n📦  Backing up ${collections.length} collections → ${backupDir}\n`);

  const manifest = {
    createdAt: new Date().toISOString(),
    database: dbName,
    uri: process.env.MONGODB_URI.replace(/:\/\/[^@]+@/, "://<credentials>@"),
    collections: {},
  };

  let totalDocs = 0;

  for (const name of collections) {
    process.stdout.write(`  → ${name.padEnd(30, " ")} `);
    try {
      const docs = await db.collection(name).find({}).toArray();
      const outFile = path.join(backupDir, `${name}.json`);
      fs.writeFileSync(outFile, JSON.stringify(docs, null, 2), "utf8");
      manifest.collections[name] = { count: docs.length, file: `${name}.json` };
      totalDocs += docs.length;
      console.log(`${docs.length} docs`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      manifest.collections[name] = { count: 0, error: err.message };
    }
  }

  // Write manifest
  fs.writeFileSync(
    path.join(backupDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`\n✅  Backup complete!`);
  console.log(`   Collections : ${collections.length}`);
  console.log(`   Total docs  : ${totalDocs}`);
  console.log(`   Location    : ${backupDir}\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Backup failed:", err.message);
  process.exit(1);
});
