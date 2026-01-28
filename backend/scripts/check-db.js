require("dotenv").config();
const { MongoClient } = require("mongodb");

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("No MONGODB_URI or MONGO_URI found in environment.");
    process.exit(2);
  }

  console.log(
    "Using MONGODB_URI from env (first 80 chars):",
    uri.slice(0, 80) + (uri.length > 80 ? "..." : ""),
  );

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    console.log("Database name:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log(
      "Collections in database:",
      collections.map((c) => c.name),
    );
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err && err.message ? err.message : err);
    if (client) await client.close();
    process.exit(3);
  }
}

run();
