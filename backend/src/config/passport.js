/**
 * Passport.js Configuration for Google OAuth 2.0
 *
 * This module configures Passport with Google OAuth 2.0 strategy.
 * It handles user authentication via Google and creates/updates
 * user records in the database.
 */

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Configure Passport with Google OAuth 2.0 Strategy
 * @param {Object} app - Express app instance
 */
function configurePassport(app) {
  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session by ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth 2.0 Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_OAUTH_REDIRECT_URI ||
          `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/auth/google/callback`,
        scope: ["profile", "email"],
        passReqToCallback: true, // Pass request to callback for accessing session
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          logger.info(
            `Google OAuth callback for user: ${profile.emails[0].value}`,
          );

          const email = profile.emails[0].value;
          const googleId = profile.id;

          // Build Google profile object
          const googleProfile = {
            id: profile.id,
            email: email,
            name: profile.displayName,
            given_name: profile.name?.givenName,
            family_name: profile.name?.familyName,
            picture: profile.photos?.[0]?.value,
            locale: profile._json?.locale,
          };

          // Find existing user by googleId or email
          let user = await User.findOne({ $or: [{ googleId }, { email }] });

          if (user) {
            // User exists - update Google info if needed
            if (user.authProvider === "local" && !user.googleId) {
              // Existing local account - link Google
              logger.info(`Linking Google account to existing user: ${email}`);
              user.googleId = googleId;
              user.googleProfile = googleProfile;
              user.authProvider = "google";
            } else {
              // Existing Google account - update profile
              user.googleProfile = googleProfile;
            }
            user.lastLogin = new Date();
            await user.save();
          } else {
            // New user - determine role from session (set by pre-auth page)
            // Default to jobseeker if not specified
            const role = req.session?.pendingRole || "jobseeker";

            logger.info(
              `Creating new Google user: ${email} with role: ${role}`,
            );
            user = await User.create({
              email,
              role,
              authProvider: "google",
              googleId,
              googleProfile,
              isEmailVerified: true, // Google emails are verified
              lastLogin: new Date(),
            });
          }

          // Clear pending role from session
          if (req.session?.pendingRole) {
            delete req.session.pendingRole;
          }

          return done(null, user);
        } catch (error) {
          logger.error("Google OAuth strategy error:", error);
          return done(error, null);
        }
      },
    ),
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  logger.info("Passport configured with Google OAuth 2.0 strategy");
}

module.exports = configurePassport;
