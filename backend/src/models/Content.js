const mongoose = require("mongoose");

const ParagraphSchema = new mongoose.Schema({
  text: { type: String },
});

const ContentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, index: true, unique: true },
    title: { type: String },
    paragraphs: [ParagraphSchema],
    mission: { type: String },
    vision: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "contents",
  },
);

// text index for search across title + paragraphs
ContentSchema.index({ title: "text", "paragraphs.text": "text" });

ContentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Content || mongoose.model("Content", ContentSchema);
