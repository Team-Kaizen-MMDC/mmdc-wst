#!/usr/bin/env node
/**
 * Verify MongoDB Atlas connection and check collections
 * This script connects to your MongoDB Atlas database and:
 * 1. Tests the connection
 * 2. Lists all collections
 * 3. Shows recent documents from profiles collection
 * 4. Shows recent documents from users collection
 *
 * Usage: node verify-mongodb.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config({
  path: require("path").resolve(__dirname, "..", ".env"),
});

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "japansswdb";

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env file");
  process.exit(1);
}

async function verifyMongoDB() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    console.log(`📊 Database: ${DB_NAME}`);
    console.log("");

    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!\n");

    const db = client.db(DB_NAME);

    // List all collections
    console.log("📚 Collections in database:");
    const collections = await db.listCollections().toArray();
    collections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });
    console.log("");

    // Check users collection
    console.log("👥 Recent users (last 3):");
    const users = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    if (users.length === 0) {
      console.log("   (No users found)");
    } else {
      users.forEach((user) => {
        console.log(
          `   - ${user.email} (${user.role}) - Created: ${user.createdAt}`,
        );
      });
    }
    console.log("");

    // Check profiles collection
    console.log("📋 Recent profiles (last 3):");
    const profiles = await db
      .collection("profiles")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    if (profiles.length === 0) {
      console.log("   (No profiles found)");
    } else {
      profiles.forEach((profile) => {
        console.log(
          `   - ${profile.firstName} ${profile.lastName} (User: ${profile.user}) - Created: ${profile.createdAt}`,
        );
      });
    }
    console.log("");

    // Count documents
    const userCount = await db.collection("users").countDocuments();
    const profileCount = await db.collection("profiles").countDocuments();
    const jobCount = await db.collection("jobs").countDocuments();
    const companyCount = await db.collection("companies").countDocuments();

    console.log("📊 Document counts:");
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Profiles: ${profileCount}`);
    console.log(`   - Jobs: ${jobCount}`);
    console.log(`   - Companies: ${companyCount}`);
    console.log("");

    console.log("✅ MongoDB Atlas verification complete!");
    console.log(
      "\n💡 Your Postman requests are configured to use this database.",
    );
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyMongoDB();
