const aboutRoutes = require("./aboutRoutes");
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const jobRoutes = require("./jobRoutes");
const companyRoutes = require("./companyRoutes");
const applicationRoutes = require("./applicationRoutes");
const userRoutes = require("./userRoutes");

module.exports = function registerRoutes(app, context) {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/profile", profileRoutes);
  app.use("/api/v1/jobs", jobRoutes);
  app.use("/api/v1/companies", companyRoutes);
  app.use("/api/v1/applications", applicationRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use(aboutRoutes(app, context));

  // Legacy health check (keeping for backward compatibility)
  app.get("/api/health", (req, res) => res.json({ ok: true }));
};
