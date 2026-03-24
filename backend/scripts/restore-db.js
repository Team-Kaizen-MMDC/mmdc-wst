#!/usr/bin/env node
/**
 * restore-db.js — Restore a MongoDB Atlas backup produced by backup-db.js
 *
 * Usage:
 *   node backend/scripts/restore-db.js --from ./backups/2026-03-24T14-30-00
 *   node backend/scripts/restore-db.js --from ./backups/2026-03-24T14-30-00 --collections users,companies
 *   node backend/scripts/restore-db.js --from ./backups/2026-03-24T14-30-00 --drop   # drop before insert
 *
 * Flags:
 *   --from <dir>         Required. Path to the backup directory.
 *   --collections <csv>  Optional. Comma-separated list of collections to restore.
 *   --drop               Optional. Drop each collection before restoring (full replace).
 *
 * npm script:  cd backend && npm run restore -- --from ./backups/<timestamp>
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
const hasFlag = (flag) => args.includes(flag);

const fromDir = getArg("--from");
const onlyArg = getArg("--collections");
const filterCollections = onlyArg ? onlyArg.split(",").map((s) => s.trim()) : null;
const dropFirst = hasFlag("--drop");

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fromDir) {
    console.error("❌  --from <backup-dir> is required.");
    console.error("    Example: node backend/scripts/restore-db.js --from ./backups/2026-03-24T14-30-00");
    process.exit(1);
  }

  const absFrom = path.resolve(fromDir);
  if (!fs.existsSync(absFrom)) {
    console.error(`❌  Backup directory not found: ${absFrom}`);
    process.exit(1);
  }

  const manifestPath = path.join(absFrom, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌  manifest.json not found in ${absFrom}. Is this a valid backup?`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  console.log(`\n📋  Backup info:`);
  console.log(`    Created    : ${manifest.createdAt}`);
  console.log(`    Database   : ${manifest.database}`);
  console.log(`    Collections: ${Object.keys(manifest.collections).length}`);

  if (!process.env.MONGODB_URI) {
    console.error("\n❌  MONGODB_URI is not set. Add it to backend/.env");
    process.exit(1);
  }

  console.log("\n🔌  Connecting to MongoDB Atlas…");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log(`✅  Connected — database: ${db.databaseName}\n`);

  const collectionsToRestore = filterCollections
    ? Object.keys(manifest.collections).filter((c) => filterCollections.includes(c))
    : Object.keys(manifest.collections);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const name of collectionsToRestore) {
    const file = path.join(absFrom, `${name}.json`);
    if (!fs.existsSync(file)) {
      console.warn(`  ⚠️  ${name}: file not found, skipping`);
      totalSkipped++;
      continue;
    }

    process.stdout.write(`  → ${name.padEnd(30, " ")} `);
    try {
      const docs = JSON.parse(fs.readFileSync(file, "utf8"));

      if (docs.length === 0) {
        console.log("0 docs (skipped)");
        continue;
      }

      const col = db.collection(name);

      if (dropFirst) {
        await col.drop().catch(() => {}); // ignore error if collection doesn't exist
      }

      // insertMany in batches of 500 to avoid driver limits
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < docs.length; i += BATCH) {
        const batch = docs.slice(i, i + BATCH);
        await col.insertMany(batch, { ordered: false }).catch((err) => {
          // duplicate key errors are common on re-restore without --drop; log and continue
          if (err.code !== 11000) throw err;
        });
        inserted += batch.length;
      }

      totalInserted += inserted;
      console.log(`${inserted} docs inserted`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n✅  Restore complete!`);
  console.log(`   Restored    : ${collectionsToRestore.length - totalSkipped} collections`);
  console.log(`   Total docs  : ${totalInserted}`);
  if (totalSkipped) console.log(`   Skipped     : ${totalSkipped}`);
  console.log();

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Restore failed:", err.message);
  process.exit(1);
});
