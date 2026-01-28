const express = require("express");
const path = require("path");
const config = require("../config");
const dbHelper = require("./config/database");
const registerRoutes = require("./routes");
const cors = require("cors");

async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve repository root as static
  app.use(express.static(path.join(__dirname, "..", "..")));

  const useMongoose = process.env.USE_MONGOOSE === "true";
  let context = {};
  let dbConnectionInstance = null; // To hold either Mongoose or Native client

  if (useMongoose) {
    const mongoose = await dbHelper.connectMongoose();
    app.locals.mongoose = mongoose;
    context.mongoose = mongoose;
    // In Mongoose, the "client" is the underlying connection
    dbConnectionInstance = mongoose.connection; 
  } else {
    const { client, db } = await dbHelper.connectNative();
    app.locals.dbClient = client;
    app.locals.db = db;
    context.db = db;
    context.client = client;
    dbConnectionInstance = client;
  }

  // Register modular routes
  registerRoutes(app, context);

  // Return dbConnectionInstance as 'client' so server.js can call .close()
  return { app, client: dbConnectionInstance };
}

module.exports = { createApp };