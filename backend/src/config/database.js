const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const config = require("../../config");

async function connectNative() {
  if (!config.MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable for native connector",
    );
  }
  const client = new MongoClient(config.MONGODB_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  return { client, db };
}

async function connectMongoose(options = {}) {
  if (!config.MONGODB_URI) {
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
    config.MONGODB_URI,
    Object.assign(defaultOptions, options),
  );
  return mongoose;
}

module.exports = {
  connectNative,
  connectMongoose,
};
