const mongoose = require("mongoose");

// Inline schema — reads from the `about` collection directly.
// The old Content model (which happened to target `about`) has been removed.
const AboutDoc =
  mongoose.models.AboutDoc ||
  mongoose.model(
    "AboutDoc",
    new mongoose.Schema({}, { strict: false, collection: "about" })
  );

async function getAboutMongoose(req, res) {
  try {
    const doc = await AboutDoc.findOne({ slug: "about" }).lean();
    if (!doc)
      return res.status(404).json({ error: "About document not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load about content" });
  }
}

async function listAboutsMongoose(req, res) {
  try {
    const docs = await AboutDoc.find({}).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load documents" });
  }
}

module.exports = { getAboutMongoose, listAboutsMongoose };
