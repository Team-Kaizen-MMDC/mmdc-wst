const config = require("../../config");

async function getAbout(db, req, res) {
  try {
    const aboutCol = db.collection(config.COLLECTIONS.ABOUT);
    const doc = await aboutCol.findOne({ slug: "about" });
    if (!doc)
      return res.status(404).json({ error: "About document not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load about content" });
  }
}

async function listAbouts(db, req, res) {
  try {
    const aboutCol = db.collection(config.COLLECTIONS.ABOUT);
    const docs = await aboutCol.find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load documents" });
  }
}

module.exports = { getAbout, listAbouts };
