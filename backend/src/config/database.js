const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

// Read URI at connection time (not module load time) so that test suites
// can override process.env.MONGODB_URI before calling createApp() without
// being foiled by a cached value from config.js's dotenv.config() call.
function getMongoUri() {
  return process.env.MONGODB_URI;
}

function getDbName() {
  return process.env.MONGODB_DB || "mmdc-wst";
}

async function connectNative() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable for native connector",
    );
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(getDbName());
  return { client, db };
}

async function connectMongoose(options = {}) {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable for mongoose connector",
    );
  }
  const defaultOptions = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  await mongoose.connect(
    uri,
    Object.assign(defaultOptions, options),
  );
  return mongoose;
}

module.exports = {
  connectNative,
  connectMongoose,
};
