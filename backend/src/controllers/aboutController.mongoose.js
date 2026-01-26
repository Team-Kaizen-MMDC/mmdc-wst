const Content = require("../models/Content");

async function getAboutMongoose(req, res) {
  try {
    const doc = await Content.findOne({ slug: "about" }).lean();
    if (!doc) return res.status(404).json({ error: "About document not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load about content" });
  }
}

async function listAboutsMongoose(req, res) {
  try {
    const docs = await Content.find({}).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load documents" });
  }
}

module.exports = { getAboutMongoose, listAboutsMongoose };
