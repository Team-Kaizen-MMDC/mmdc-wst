/**
 * OAuth Authentication Routes
 *
 * Handles Google OAuth 2.0 authentication flow using Passport.js
 */

const express = require("express");
const passport = require("passport");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * @route   GET /auth/google
 * @desc    Initiates Google OAuth 2.0 flow
 * @access  Public
 * @query   {string} role - Optional: 'jobseeker' or 'employer' to set user role for new accounts
 * @query   {string} redirect - Optional: URL to redirect after successful auth
 */
router.get("/google", (req, res, next) => {
  // Store role preference in session for new user creation
  if (req.query.role) {
    req.session.pendingRole = req.query.role;
  }

  // Store redirect URL for after authentication
  if (req.query.redirect) {
    req.session.authRedirect = req.query.redirect;
  }

  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      logger.error("Session save error:", err);
    }

    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account", // Always show account picker
    })(req, res, next);
  });
});

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback URL
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/pages/signin.html?error=auth_failed",
    failureMessage: true,
  }),
  async (req, res) => {
    try {
      // User authenticated successfully
      const user = req.user;

      if (!user) {
        logger.error("OAuth callback: No user object received");
        return res.redirect("/pages/signin.html?error=no_user");
      }

      logger.info(
        `User authenticated via Google: ${user.email} (${user.role})`,
      );

      // Generate JWT token for API authentication
      const token = user.getSignedJwtToken();
      logger.info(`Generated JWT token for user: ${user.email}`);

      // Store token in session for client-side retrieval
      req.session.authToken = token;
      req.session.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      // Set isLoggedIn cookie for frontend auth checks
      res.cookie("isLoggedIn", "true", {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: false, // Allow JS access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Set email cookie (for frontend display)
      res.cookie("email", user.email, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Set token cookie so frontend can call protected APIs (not httpOnly
      // because frontend reads it via `document.cookie`).
      res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      // Determine redirect URL
      let redirectUrl = req.session.authRedirect;
      delete req.session.authRedirect;

      if (!redirectUrl) {
        // Default redirect based on user role
        redirectUrl =
          user.role === "employer"
            ? "/pages/companyDashboard.html"
            : "/pages/profileDashboard.html";
      }

      // Add token as query parameter so client can store it
      const separator = redirectUrl.includes("?") ? "&" : "?";
      const finalUrl = `${redirectUrl}${separator}token=${token}`;

      logger.info(`Redirecting user ${user.email} to: ${finalUrl}`);
      res.redirect(finalUrl);
    } catch (error) {
      logger.error("OAuth callback error:", error);
      console.error("OAuth callback error stack:", error.stack);
      res.redirect("/pages/signin.html?error=auth_error");
    }
  },
);

/**
 * @route   GET /auth/logout
 * @desc    Logout user and destroy session
 * @access  Public
 */
router.get("/logout", (req, res) => {
  const userEmail = req.user?.email || "unknown";

  req.logout((err) => {
    if (err) {
      logger.error("Logout error:", err);
      return res.redirect("/pages/signin.html?error=logout_failed");
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error("Session destroy error:", err);
      }

      logger.info(`User logged out: ${userEmail}`);
      // Clear client-side auth cookies
      res.cookie("isLoggedIn", "", { expires: new Date(0), path: "/" });
      res.cookie("email", "", { expires: new Date(0), path: "/" });
      res.cookie("token", "", { expires: new Date(0), path: "/" });

      res.redirect("/pages/signin.html?message=logged_out");
    });
  });
});

/**
 * @route   GET /auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get("/status", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      token: req.session.authToken || null,
    });
  } else {
    res.json({
      authenticated: false,
      user: null,
      token: null,
    });
  }
});

module.exports = router;
