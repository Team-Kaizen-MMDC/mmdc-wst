const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load .env from backend directory (parent of scripts/)
const envPath = path.join(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });

async function run() {
  // Check if .env file exists
  const envExists = fs.existsSync(envPath);

  console.log("=== Environment Configuration Check ===");
  console.log(`.env file exists: ${envExists ? "✅ YES" : "❌ NO"}`);

  if (!envExists) {
    console.error("\n❌ ERROR: .env file not found at:", envPath);
    console.error(
      "\nPlease create a .env file in the backend/ directory with:",
    );
    console.error("  MONGODB_URI=your_mongodb_connection_string");
    console.error("\nYou can copy from .env.example if available.");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error(
      "\n❌ ERROR: No MONGODB_URI or MONGO_URI found in .env file.",
    );
    console.error("\nPlease add to your .env file:");
    console.error("  MONGODB_URI=your_mongodb_connection_string");
    process.exit(2);
  }

  console.log(
    "\nMongoDB URI configured:",
    uri.slice(0, 80) + (uri.length > 80 ? "..." : ""),
  );

  console.log("\n=== Attempting MongoDB Connection ===");
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ MongoDB connection successful!");

    const db = client.db();
    console.log("\n=== Database Information ===");
    console.log("Database name:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log("\nCollections found:", collections.length);
    if (collections.length > 0) {
      console.log("Collection names:");
      collections.forEach((c) => console.log(`  - ${c.name}`));
    } else {
      console.log("  (No collections yet - this is normal for a new database)");
    }

    await client.close();
    console.log("\n✅ All checks passed! Database is ready to use.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ MongoDB connection failed!");
    console.error("Error:", err && err.message ? err.message : err);
    console.error("\nPlease verify:");
    console.error("  1. MongoDB URI is correct");
    console.error(
      "  2. Network access is allowed (check MongoDB Atlas whitelist)",
    );
    console.error("  3. Database user credentials are correct");
    if (client) await client.close();
    process.exit(3);
  }
}

run();
