const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
// Note: express-mongo-sanitize v2.x is incompatible with Express 5
// TODO: Upgrade to v3.x when available or use alternative sanitization
// const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const config = require("../config");
const dbHelper = require("./config/database");
const registerRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

async function createApp() {
  const app = express();

  // Security middleware - enforce a Content Security Policy that explicitly
  // allows the CDNs and external resources used by the site while keeping a
  // secure default. This prevents the browser from blocking vital scripts
  // (Tailwind CDN, jsDelivr, Google Fonts) yet maintains strong defaults.
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Allow inline scripts for page content loading
      "https://cdn.tailwindcss.com",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com",
      "https://accounts.google.com",
    ],
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net",
      "'unsafe-inline'",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
    ],
    imgSrc: ["'self'", "data:", "https:", "https://lh3.googleusercontent.com"],
    connectSrc: ["'self'", "https://accounts.google.com"],
    frameAncestors: ["'self'"],
    objectSrc: ["'none'"],
    formAction: ["'self'", "https://accounts.google.com"],
    workerSrc: ["'self'", "blob:"],
  };

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: cspDirectives,
      },
    }),
  );

  // CORS configuration
  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5000",
            "http://127.0.0.1:5500",
          ],
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Body parser middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Session Middleware (for Google O-Auth)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Sanitize data - temporarily disabled due to Express 5 compatibility
  // app.use(mongoSanitize());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  // HTTP request logger
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(
      morgan("combined", {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      }),
    );
  }

  // API Documentation with Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Japan SSW API Documentation",
    }),
  );

  // Swagger JSON endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });


  // Shortcut for local development checks: skip DB/connect and route registration
  // when SKIP_DB=true to allow starting the server for static file and header
  // verification without needing a MongoDB connection.
  if (process.env.SKIP_DB === "true") {
    return { app, client: null };
  }

  // Connect using Mongoose if requested (USE_MONGOOSE=true). Otherwise use the
  // native driver. We pass a `context` object to route registrars so they can
  // pick mongoose-backed controllers when available.
  let context = {};
  if (process.env.SKIP_DB !== "true") {
    const useMongoose = process.env.USE_MONGOOSE === "true";
    if (useMongoose) {
      // If using Mongoose, wait for connection and set context
      const mongoose = await dbHelper.connectMongoose();
      app.locals.mongoose = mongoose;
      context.mongoose = mongoose;
    } else {
      // If using Native driver
      const { client, db } = await dbHelper.connectNative();
      app.locals.dbClient = client;
      app.locals.db = db;
      context.db = db;
      context.client = client;
    }
  }

  registerRoutes(app, context);

//Check root path for Google code before serving index.html
app.get('/', (req, res, next) => {
    if (req.query.code) {
      return passport.authenticate('google', { 
        session: false, 
        failureRedirect: '/pages/signin.html' 
      })(req, res, next);
    }
    next();
  }, (req, res) => {
    const token = req.user.getSignedJwtToken();
    res.redirect(`/pages/signin.html?token=${token}`);
  });

  app.use(express.static(path.join(__dirname, "..", "..")));  

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      status: "error",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return { app, client: context.client || null };
}

module.exports = { createApp };
