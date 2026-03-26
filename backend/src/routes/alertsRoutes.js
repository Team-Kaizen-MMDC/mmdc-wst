const express = require("express");

module.exports = function createAlertsRouter(app, context) {
  const router = express.Router();

  // Subscribe endpoint: accepts { email }
  router.post("/api/v1/alerts/subscribe", async (req, res) => {
    try {
      const email = req.body && req.body.email ? String(req.body.email).trim().toLowerCase() : null;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "invalid_email" });
      }

      const doc = { email, createdAt: new Date() };

      // Prefer native driver (context.db) if available, otherwise use mongoose connection
      if ((context && context.db) || app.locals.db) {
        const db = context && context.db ? context.db : app.locals.db;
        const result = await db.collection("job_alerts").insertOne(doc);
        return res.status(201).json({ success: true, id: result.insertedId });
      }

      if ((context && context.mongoose) || app.locals.mongoose) {
        // Use mongoose connection's collection helper to avoid creating models
        const coll = app.locals.mongoose.connection.collection("job_alerts");
        const result = await coll.insertOne(doc);
        return res.status(201).json({ success: true, id: result.insertedId });
      }

      return res.status(500).json({ message: "db_not_configured" });
    } catch (err) {
      console.error("/api/v1/alerts/subscribe error:", err);
      return res.status(500).json({ message: "server_error" });
    }
  });

  return router;
};
