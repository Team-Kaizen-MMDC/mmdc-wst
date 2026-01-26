const express = require("express");
const controllers = require("../controllers/contentController");

module.exports = function createContentRouter(db) {
  const router = express.Router();

  router.post("/api/content", (req, res) => controllers.upsertContent(db, req, res));

  return router;
};
