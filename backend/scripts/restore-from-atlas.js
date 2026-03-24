#!/usr/bin/env node
/**
 * restore-from-atlas.js — Restore a backup snapshot stored in the
 * japansswdb_backups Atlas database (written by backup-db.js --push-to-atlas).
 *
 * Usage:
 *   # List all available snapshots
 *   node backend/scripts/restore-from-atlas.js --list
 *
 *   # Restore the latest snapshot
 *   node backend/scripts/restore-from-atlas.js --latest
 *
 *   # Restore a specific session
 *   node backend/scripts/restore-from-atlas.js --session 2026-03-24T14-30-00
 *
 *   # Restore specific collections only
 *   node backend/scripts/restore-from-atlas.js --session 2026-03-24T14-30-00 --collections users,companies
 *
 *   # Drop before restore (full replace)
 *   node backend/scripts/restore-from-atlas.js --session 2026-03-24T14-30-00 --drop
 *
 * npm script:
 *   cd backend && npm run restore:atlas -- --latest
 *   cd backend && npm run restore:atlas -- --list
 *   cd backend && npm run restore:atlas -- --session 2026-03-24T14-30-00 --drop
 */

"use strict";
require("dotenv").config();

const mongoose = require("mongoose");

const BACKUP_DB_NAME = "japansswdb_backups";

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const listMode    = hasFlag("--list");
const latestMode  = hasFlag("--latest");
const sessionArg  = getArg("--session");
const onlyArg     = getArg("--collections");
const filterCols  = onlyArg ? onlyArg.split(",").map((s) => s.trim()) : null;
const dropFirst   = hasFlag("--drop");

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI not set. Add it to backend/.env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB Atlas…");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const sourceDb = mongoose.connection.db;
  const backupDb = sourceDb.client.db(BACKUP_DB_NAME);
  console.log("✅  Connected\n");

  // ── List mode ────────────────────────────────────────────────────────────
  if (listMode) {
    const sessions = await backupDb
      .collection("_sessions")
      .find({}, { projection: { session: 1, createdAt: 1, database: 1, totalDocs: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    if (sessions.length === 0) {
      console.log("📭  No Atlas snapshots found. Run: npm run backup:atlas");
    } else {
      console.log(`📋  Available Atlas snapshots (${sessions.length}):\n`);
      for (const s of sessions) {
        const colCount = s.collections ? Object.keys(s.collections).length : "?";
        console.log(`  🗂  ${s.session}`);
        console.log(`      Database  : ${s.database}`);
        console.log(`      Created   : ${s.createdAt}`);
        console.log(`      Docs      : ${s.totalDocs || "?"}`);
        console.log();
      }
      console.log(`  To restore latest: npm run restore:atlas -- --latest`);
      console.log(`  To restore a specific session: npm run restore:atlas -- --session <session-id>`);
    }
    await mongoose.disconnect();
    return;
  }

  // ── Resolve session ───────────────────────────────────────────────────────
  let session;
  if (latestMode) {
    const latest = await backupDb
      .collection("_sessions")
      .findOne({}, { sort: { createdAt: -1 } });
    if (!latest) {
      console.error("❌  No snapshots found in Atlas. Run: npm run backup:atlas");
      await mongoose.disconnect();
      process.exit(1);
    }
    session = latest.session;
    console.log(`📌  Using latest snapshot: ${session}\n`);
  } else if (sessionArg) {
    session = sessionArg;
  } else {
    console.error("❌  Specify --list, --latest, or --session <id>");
    console.error("    Example: npm run restore:atlas -- --latest");
    await mongoose.disconnect();
    process.exit(1);
  }

  // Verify session exists
  const sessionDoc = await backupDb.collection("_sessions").findOne({ session });
  if (!sessionDoc) {
    console.error(`❌  Session '${session}' not found in ${BACKUP_DB_NAME}._sessions`);
    console.error("    Run: npm run restore:atlas -- --list");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`📋  Snapshot info:`);
  console.log(`    Session    : ${sessionDoc.session}`);
  console.log(`    Created    : ${sessionDoc.createdAt}`);
  console.log(`    Source DB  : ${sessionDoc.database}`);
  console.log(`    Total docs : ${sessionDoc.totalDocs || "?"}\n`);

  // Find collections that have data for this session
  const backupColNames = (await backupDb.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => n !== "_sessions");

  // Check which collections have docs for this session
  const collectionsToRestore = [];
  for (const name of backupColNames) {
    const exists = await backupDb.collection(name).findOne({ session });
    if (exists) {
      if (!filterCols || filterCols.includes(name)) {
        collectionsToRestore.push(name);
      }
    }
  }

  if (collectionsToRestore.length === 0) {
    console.warn("⚠️   No matching collections found for this session.");
    await mongoose.disconnect();
    return;
  }

  console.log(
    `🔄  Restoring ${collectionsToRestore.length} collection(s)${dropFirst ? " (--drop mode)" : ""}…\n`
  );

  let totalInserted = 0;

  for (const name of collectionsToRestore) {
    process.stdout.write(`  → ${name.padEnd(30, " ")} `);

    try {
      // Fetch all chunks for this session + collection, sorted by chunk index
      const chunks = await backupDb
        .collection(name)
        .find({ session })
        .sort({ chunk: 1 })
        .toArray();

      const allDocs = chunks.flatMap((c) => c.docs);

      if (allDocs.length === 0) {
        console.log("0 docs (skipped)");
        continue;
      }

      const targetCol = sourceDb.collection(name);

      if (dropFirst) {
        await targetCol.drop().catch(() => {}); // ignore if doesn't exist
      }

      // Insert in batches of 500
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < allDocs.length; i += BATCH) {
        await targetCol
          .insertMany(allDocs.slice(i, i + BATCH), { ordered: false })
          .catch((err) => {
            if (err.code !== 11000) throw err; // ignore duplicate key on re-restore
          });
        inserted += Math.min(BATCH, allDocs.length - i);
      }

      totalInserted += inserted;
      console.log(`${inserted} docs restored`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n✅  Atlas restore complete!`);
  console.log(`   Session     : ${session}`);
  console.log(`   Collections : ${collectionsToRestore.length}`);
  console.log(`   Total docs  : ${totalInserted}\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Restore from Atlas failed:", err.message);
  process.exit(1);
});
