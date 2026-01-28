const aboutRoutes = require("./aboutRoutes");
const contentRoutes = require("./contentRoutes");
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const jobRoutes = require("./jobRoutes");
const companyRoutes = require("./companyRoutes");

module.exports = function registerRoutes(app, context) {
  // Mount API v1 routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/profile", profileRoutes);
  app.use("/api/v1/jobs", jobRoutes);
  app.use("/api/v1/companies", companyRoutes);

  // Mount modular routers. `context` may contain `{ db, client }` for native
  // driver or `{ mongoose }` when using Mongoose. Individual route modules
  // should prefer mongoose controllers when available.
  app.use(aboutRoutes(app, context));
  app.use(contentRoutes(context.db || {}));

  // Legacy health check (keeping for backward compatibility)
  app.get("/api/health", (req, res) => res.json({ ok: true }));
};
