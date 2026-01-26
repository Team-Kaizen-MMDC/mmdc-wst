const express = require("express");
const controllers = require("../controllers/aboutController");

module.exports = function createAboutRouter(app, context) {
  const router = express.Router();

  // If Mongoose is available on the app/context, prefer the mongoose-based
  // controller. Otherwise fall back to the native-db controller.
  if ((context && context.mongoose) || app.locals.mongoose) {
    const mCtrl = require("../controllers/aboutController.mongoose");
    router.get("/api/about", (req, res) => mCtrl.getAboutMongoose(req, res));
    router.get("/api/abouts", (req, res) => mCtrl.listAboutsMongoose(req, res));
  } else {
    router.get("/api/about", (req, res) =>
      controllers.getAbout(context.db, req, res),
    );
    router.get("/api/abouts", (req, res) =>
      controllers.listAbouts(context.db, req, res),
    );
  }

  return router;
};
