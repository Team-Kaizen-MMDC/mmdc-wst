const express = require("express");
const config = require("../../config");

module.exports = function createContentRouter(db) {
  const router = express.Router();
  const contentCol = db.collection(config.COLLECTIONS.CONTENT);

  // POST /api/content -> upsert a content document
  router.post("/api/content", async (req, res) => {
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

  return router;
};
