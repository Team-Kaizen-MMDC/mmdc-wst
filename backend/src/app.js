const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const config = require("../config");

async function createApp() {
  const app = express();
  app.use(express.json());

  // Serve repository root as static so pages/*.html are reachable at /pages/*.html
  app.use(express.static(path.join(__dirname, "..", "..")));

  // Connect to MongoDB using native driver (keeps existing minimal stack)
  if (!config.MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Create a .env with MONGODB_URI.",
    );
  }

  const client = new MongoClient(config.MONGODB_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);

  const aboutCol = db.collection(config.COLLECTIONS.ABOUT);
  const contentCol = db.collection(config.COLLECTIONS.CONTENT);

  // API: GET /api/about -> returns the about document from the DB
  app.get("/api/about", async (req, res) => {
    try {
      const doc = await aboutCol.findOne({ slug: "about" });
      if (!doc) return res.status(404).json({ error: "About document not found" });
      res.json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load about content" });
    }
  });

  // API: GET /api/abouts -> return all documents in the collection
  app.get("/api/abouts", async (req, res) => {
    try {
      const docs = await aboutCol.find({}).toArray();
      res.json(docs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // API: POST /api/content -> upsert a content document (useful for manual imports / Postman)
  app.post("/api/content", async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || !payload.slug) {
        return res.status(400).json({ error: "Missing required field: slug" });
      }

      const now = new Date();
      const doc = Object.assign({}, payload, {
        updatedAt: now,
        createdAt: payload.createdAt || now,
      });
      const result = await contentCol.replaceOne({ slug: payload.slug }, doc, {
        upsert: true,
      });
      return res.status(201).json({ ok: true, result });
    } catch (err) {
      console.error("Failed to upsert content", err);
      return res.status(500).json({ error: "Failed to upsert content" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => res.json({ ok: true }));

  return { app, client };
}

module.exports = { createApp };
