const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());
const config = require("./config");

const PORT = config.PORT;
const MONGODB_URI = config.MONGODB_URI;
const DB_NAME = config.DB_NAME;
// Use content/about collection from config.COLLECTIONS
// collection names: config.COLLECTIONS.ABOUT, .CONTENT, .JOBS, .USERS

if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI environment variable. Create a .env with MONGODB_URI.",
  );
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

async function start() {
  await client.connect();
  console.log("Connected to MongoDB Atlas");

  const db = client.db(DB_NAME);
  const col = db.collection(config.COLLECTIONS.ABOUT);

  // Serve repository root as static so pages/*.html are reachable at /pages/*.html
  app.use(express.static(path.join(__dirname, "..")));

  // API: GET /api/about -> returns the about document from the DB (no hardcoded seeding)
  app.get("/api/about", async (req, res) => {
    try {
      const doc = await col.findOne({ slug: "about" });
      if (!doc) {
        return res.status(404).json({ error: "About document not found" });
      }
      res.json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load about content" });
    }
  });

  // API: GET /api/abouts -> return all documents in the collection
  app.get("/api/abouts", async (req, res) => {
    try {
      const docs = await col.find({}).toArray();
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

      const contentCol = db.collection(config.COLLECTIONS.CONTENT);
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

  app.listen(PORT, () => {
    console.log(
      `Server listening on http://localhost:${PORT} — open /pages/about.html`,
    );
  });
}

start().catch((err) => {
  console.error("Fatal error starting server", err);
  process.exit(1);
});
