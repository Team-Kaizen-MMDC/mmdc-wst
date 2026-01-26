const express = require("express");
const controllers = require("../controllers/aboutController");

module.exports = function createAboutRouter(db) {
  const router = express.Router();

  router.get("/api/about", (req, res) => controllers.getAbout(db, req, res));
  router.get("/api/abouts", (req, res) => controllers.listAbouts(db, req, res));

  return router;
};
