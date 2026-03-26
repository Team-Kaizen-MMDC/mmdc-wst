#!/usr/bin/env node

/**
 * create-job-alerts-unique-index.js
 *
 * Usage:
 *   MONGODB_URI="..." node backend/scripts/create-job-alerts-unique-index.js [--dry-run] [--dedupe]
 *
 * By default: reports duplicates and exits if any found.
 * --dry-run : list duplicates and exit
 * --dedupe  : keep earliest createdAt per email, delete other docs, then create unique index
 */

const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const dedupe = argv.includes('--dedupe');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DB || 'mmdc-wst';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection('job_alerts');

    console.log('Scanning for duplicate emails in job_alerts...');
    const dupAgg = [
      { $group: { _id: '$email', count: { $sum: 1 }, ids: { $push: '$_id' }, dates: { $push: '$createdAt' } } },
      { $match: { count: { $gt: 1 } } },
      { $project: { email: '$_id', count: 1, ids: 1, dates: 1 } },
    ];

    const dups = await coll.aggregate(dupAgg).toArray();
    if (!dups || dups.length === 0) {
      console.log('No duplicate emails found. Creating unique index on email...');
      await coll.createIndex({ email: 1 }, { unique: true });
      console.log('Unique index created successfully.');
      await client.close();
      process.exit(0);
    }

    console.log(`Found ${dups.length} duplicate email groups.`);

    if (dryRun) {
      console.log('Dry-run mode: listing duplicates (first 50 chars)...');
      dups.forEach((d) => {
        console.log(`- ${d.email} (count=${d.count})`);
      });
      await client.close();
      process.exit(0);
    }

    if (!dedupe) {
      console.error('Duplicates exist. Run with --dedupe to remove duplicates and create the unique index.');
      await client.close();
      process.exit(2);
    }

    console.log('Deduplicating: keeping earliest createdAt for each email...');
    for (const group of dups) {
      const { email, ids } = group;
      // Fetch docs to determine earliest createdAt (safest)
      const docs = await coll.find({ _id: { $in: ids } }).toArray();
      if (!docs || docs.length <= 1) continue;
      docs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      const keep = docs[0];
      const remove = docs.slice(1).map((d) => d._id);
      console.log(`Email ${email} -> keeping ${keep._id}, removing ${remove.length} duplicates`);
      await coll.deleteMany({ _id: { $in: remove } });
    }

    console.log('All duplicates removed. Creating unique index...');
    try {
      await coll.createIndex({ email: 1 }, { unique: true });
      console.log('Unique index created successfully.');
    } catch (ixErr) {
      console.error('Error creating unique index:', ixErr);
      console.error('Please inspect the collection and resolve any remaining conflicts.');
      await client.close();
      process.exit(3);
    }

    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during migration script:', err);
    try { await client.close(); } catch (e) {}
    process.exit(1);
  }
}

main();
