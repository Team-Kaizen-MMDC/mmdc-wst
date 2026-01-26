const aboutRoutes = require("./aboutRoutes");
const contentRoutes = require("./contentRoutes");

module.exports = function registerRoutes(app, db) {
  // Mount modular routers
  app.use(aboutRoutes(db));
  app.use(contentRoutes(db));

  // Health check
  app.get("/api/health", (req, res) => res.json({ ok: true }));
};
