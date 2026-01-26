const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const config = require("../config");

async function createApp() {
  const app = express();
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

    // Connect using the native driver by default. The database helper also exposes
    // a Mongoose connector for future migrations.
    const { client, db } = await dbHelper.connectNative();

    // Register modular routes (pass db so routers can access collections)
    registerRoutes(app, db);

    return { app, client };
  }

  module.exports = { createApp };
        return res.status(404).json({ error: "About document not found" });
