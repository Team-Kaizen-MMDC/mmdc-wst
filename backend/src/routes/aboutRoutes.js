const express = require("express");
const config = require("../../config");

module.exports = function createAboutRouter(db) {
  const router = express.Router();
  const aboutCol = db.collection(config.COLLECTIONS.ABOUT);

  // GET /api/about -> returns the about document
  router.get("/api/about", async (req, res) => {
    try {
      const doc = await aboutCol.findOne({ slug: "about" });
      if (!doc)
        return res.status(404).json({ error: "About document not found" });
      res.json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load about content" });
    }
  });

  // GET /api/abouts -> return all documents in the about collection
  router.get("/api/abouts", async (req, res) => {
    try {
      const docs = await aboutCol.find({}).toArray();
      res.json(docs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load documents" });
    }
  });

  return router;
};
