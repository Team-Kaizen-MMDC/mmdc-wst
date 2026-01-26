const aboutRoutes = require("./aboutRoutes");
const contentRoutes = require("./contentRoutes");

module.exports = function registerRoutes(app, context) {
  // Mount modular routers. `context` may contain `{ db, client }` for native
  // driver or `{ mongoose }` when using Mongoose. Individual route modules
  // should prefer mongoose controllers when available.
  app.use(aboutRoutes(app, context));
  app.use(contentRoutes(context.db || {}));

  // Health check
  app.get("/api/health", (req, res) => res.json({ ok: true }));
};
