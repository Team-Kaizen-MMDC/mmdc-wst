const express = require("express");
const path = require("path");
const config = require("../config");
const dbHelper = require("./config/database");
const registerRoutes = require("./routes");

async function createApp() {
  const app = express();
  app.use(express.json());

  // Serve repository root as static so pages/*.html are reachable at /pages/*.html
  app.use(express.static(path.join(__dirname, "..", "..")));

  // Connect using Mongoose if requested (USE_MONGOOSE=true). Otherwise use the
  // native driver. We pass a `context` object to route registrars so they can
  // pick mongoose-backed controllers when available.
  const useMongoose = process.env.USE_MONGOOSE === "true";
  let context = {};
  if (useMongoose) {
    const mongoose = await dbHelper.connectMongoose();
    // expose mongoose on app.locals for other modules/tests
    app.locals.mongoose = mongoose;
    context.mongoose = mongoose;
  } else {
    const { client, db } = await dbHelper.connectNative();
    app.locals.dbClient = client;
    app.locals.db = db;
    context.db = db;
    context.client = client;
  }

  // Register modular routes (pass context so routes can pick native or mongoose)
  registerRoutes(app, context);

  return { app, client };
}

module.exports = { createApp };
