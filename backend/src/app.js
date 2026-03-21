const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const configurePassport = require("./config/passport");
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
const cookieParser = require("cookie-parser");

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
      "https://accounts.google.com", // Google Sign-In library
    ],
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net",
      "'unsafe-inline'",
      "https://accounts.google.com", // Google Sign-In styles
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
    ],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: [
      "'self'",
      "https://accounts.google.com", // Google OAuth API calls
      "https://cdn.jsdelivr.net", // CDN resources
      "https://*.gstatic.com", // Google static resources
    ],
    frameAncestors: ["'self'"],
    frameSrc: ["https://accounts.google.com"], // Google OAuth popup
    objectSrc: ["'none'"],
    formAction: ["'self'"],
    workerSrc: ["'self'", "blob:"],
  };

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: cspDirectives,
      },
      // Disable upgrade-insecure-requests in development (incompatible with localhost)
      contentSecurityPolicy:
        process.env.NODE_ENV === "production"
          ? {
              directives: cspDirectives,
            }
          : {
              directives: {
                ...cspDirectives,
                upgradeInsecureRequests: null, // Don't force HTTPS in dev
              },
            },
      // Allow cross-origin for Google OAuth in development
      crossOriginOpenerPolicy:
        process.env.NODE_ENV === "production"
          ? { policy: "same-origin" }
          : false,
      crossOriginResourcePolicy:
        process.env.NODE_ENV === "production"
          ? { policy: "same-origin" }
          : false,
    }),
  );

  // CORS configuration
  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL ||
          (process.env.RAILWAY_PUBLIC_DOMAIN
            ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
            : undefined)
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

  app.use(cookieParser());

  // Temporary request logger for OAuth/GSI debugging
  app.use((req, res, next) => {
    try {
      const smallBody =
        req.body && Object.keys(req.body).length
          ? JSON.stringify(req.body)
          : "<empty>";
      console.log(
        `REQ_LOG ${new Date().toISOString()} ${req.method} ${req.originalUrl} - body=${smallBody}`,
      );
      // Show important headers without sensitive cookies
      const hdrs = {
        origin: req.headers.origin || null,
        referer: req.headers.referer || null,
        host: req.headers.host || null,
        "user-agent": req.headers["user-agent"] || null,
      };
      console.log("REQ_LOG headers:", hdrs);
    } catch (e) {
      // ignore logging errors
    }
    next();
  });

  // Temporary request logger for OAuth/GSI debugging
  app.use((req, res, next) => {
    try {
      const relevant =
        req.originalUrl &&
        (req.originalUrl.startsWith("/api/") ||
          req.originalUrl.startsWith("/auth/") ||
          req.originalUrl.startsWith("/debug/"));
      if (relevant) {
        const info = {
          time: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl,
          origin: req.get("origin") || null,
          referer: req.get("referer") || null,
          headers: {
            cookie: req.get("cookie") || null,
            host: req.get("host") || null,
            referer: req.get("referer") || null,
            "user-agent": req.get("user-agent") || null,
          },
          body: req.body || null,
        };
        // eslint-disable-next-line no-console
        console.log("[REQ-DEBUG]", JSON.stringify(info));
      }
    } catch (err) {
      // ignore logging errors
    }
    return next();
  });

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

  // Session middleware (development-friendly defaults)
  app.use(
    session({
      name: "jssw.sid",
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    }),
  );

  // Initialize Passport for OAuth
  configurePassport(app);

  // Serve repository root as static so pages/*.html are reachable at /pages/*.html
  app.use(express.static(path.join(__dirname, "..", "..")));

  // OAuth routes (Passport-based Google OAuth 2.0)
  const oauthRoutes = require("./routes/oauthRoutes");
  app.use("/auth", oauthRoutes);

  // Debug session endpoint
  app.get("/debug/session", (req, res) => {
    res.json({
      session: req.session || null,
      authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user || null,
    });
  });

  // LEGACY: POST endpoint to accept GSI ID tokens from client (kept for backward compatibility)
  // New implementation uses OAuth redirect flow via /auth/google
  // This endpoint can be removed if you want to fully deprecate GSI
  app.post("/api/v1/auth/google", async (req, res) => {
    try {
      const idToken =
        req.body && req.body.googleToken ? req.body.googleToken : null;
      if (!idToken)
        return res.status(400).json({ message: "missing_google_token" });

      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
      if (!GOOGLE_CLIENT_ID) {
        return res
          .status(500)
          .json({ message: "google_client_id_not_configured" });
      }

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      // Basic user object
      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        locale: payload.locale,
        verified_email: payload.email_verified,
      };

      // Mint app JWT
      const token = jwt.sign(
        { sub: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || "dev-jwt-secret",
        {
          expiresIn: process.env.JWT_EXPIRE || "7d",
        },
      );

      return res.json({ data: { token, user } });
    } catch (err) {
      console.error("/api/v1/auth/google verification error:", err);
      return res
        .status(500)
        .json({ message: "google_token_verification_failed" });
    }
  });

  // Expose minimal runtime config for frontend pages (safe to expose client IDs)
  // This allows static pages to dynamically obtain the Google Client ID from
  // server environment without embedding .env values directly into source.
  app.get("/config", (req, res) => {
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    });
  });

  // Debug endpoint: allow pages to POST the client_id and origin they will
  // use to request GSI resources so we can log and inspect mismatches.
  app.post("/debug/log-gsi", (req, res) => {
    try {
      const clientId = req.body && req.body.clientId ? req.body.clientId : null;
      const origin =
        req.headers.origin ||
        (req.body && req.body.origin) ||
        req.get("referer") ||
        req.ip;
      const ua = req.get("user-agent") || "";
      const info = {
        time: new Date().toISOString(),
        clientId,
        origin,
        ip: req.ip,
        userAgent: ua,
      };
      if (logger && typeof logger.info === "function") {
        logger.info(`GSI debug: ${JSON.stringify(info)}`);
      } else {
        // Fallback to console for development
        // eslint-disable-next-line no-console
        console.log("GSI debug:", info);
      }
      // Keep response minimal
      res.status(204).end();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error logging GSI debug info", err);
      res.status(500).json({ error: "failed to log" });
    }
  });

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
  const useMongoose = process.env.USE_MONGOOSE === "true";
  let context = {};
  if (useMongoose) {
    const mongoose = await dbHelper.connectMongoose();
    // expose mongoose on app.locals for other modules/tests
    app.locals.mongoose = mongoose;
    context.mongoose = mongoose;
  } else {
    const { client, db } = await dbHelper.connectNative();
    app.locals.dbClient = client;
    app.locals.db = db;
    context.db = db;
    context.client = client;
  }

  // Register modular routes (pass context so routes can pick native or mongoose)
  registerRoutes(app, context);

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
