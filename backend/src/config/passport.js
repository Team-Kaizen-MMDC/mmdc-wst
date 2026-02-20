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
const axios = require("axios");
const UserProfile = require("../models/UserProfile");

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
            try {
              await user.save();
              logger.info(
                `Saved existing user (updated Google fields): ${user.email} (${user._id})`,
              );
            } catch (saveErr) {
              logger.error(
                `Failed saving existing user ${email}: ${saveErr.message || saveErr}`,
              );
              throw saveErr;
            }
          } else {
            // New user - determine role from session (set by pre-auth page)
            // Default to jobseeker if not specified
            const role = req.session?.pendingRole || "jobseeker";

            logger.info(
              `Creating new Google user: ${email} with role: ${role}`,
            );
            try {
              user = await User.create({
                email,
                role,
                authProvider: "google",
                googleId,
                googleProfile,
                isEmailVerified: true, // Google emails are verified
                lastLogin: new Date(),
              });
              logger.info(`Created new user: ${user.email} (${user._id})`);
            } catch (createErr) {
              logger.error(
                `Error creating new Google user ${email}: ${createErr.message || createErr}`,
              );
              throw createErr;
            }

            // Create minimal UserProfile for new user so UI has a profile document
            try {
              const existingProfile = await UserProfile.findOne({
                user: user._id,
              });
              if (!existingProfile) {
                // Ensure required fields are non-empty to satisfy UserProfile schema
                let firstName = googleProfile.given_name || "";
                let lastName = googleProfile.family_name || "";

                // If only a full name is provided, try splitting it
                if (!firstName && googleProfile.name) {
                  const parts = String(googleProfile.name).trim().split(/\s+/);
                  if (parts.length === 1) {
                    firstName = parts[0];
                  } else if (parts.length > 1) {
                    firstName = parts.slice(0, -1).join(" ");
                    lastName = lastName || parts.slice(-1).join(" ");
                  }
                }

                // Final fallbacks to avoid empty required fields
                if (!firstName) firstName = "User";
                if (!lastName) lastName = "";

                const profileData = {
                  user: user._id,
                  firstName,
                  lastName,
                  dateOfBirth: googleProfile.dateOfBirth
                    ? new Date(googleProfile.dateOfBirth)
                    : new Date("1970-01-01"),
                  nationality: googleProfile.locale
                    ? String(googleProfile.locale).split("-").pop()
                    : "not-applicable",
                  photoPath: googleProfile.picture || undefined,
                  availability: { visaStatus: "not-applicable" },
                };
                try {
                  await UserProfile.create(profileData);
                  logger.info(`Created UserProfile for new user ${user._id}`);
                } catch (upErr) {
                  logger &&
                    logger.warn &&
                    logger.warn(
                      `Could not create UserProfile for user ${user._id}: ${upErr.message || upErr}`,
                    );
                }
              }
            } catch (err) {
              logger &&
                logger.warn &&
                logger.warn(
                  "Error checking/creating UserProfile in passport strategy:",
                  err.message || err,
                );
            }
          }

          // Clear pending role from session
          if (req.session?.pendingRole) {
            delete req.session.pendingRole;
          }

          // Attempt to enrich user data by calling Google People API using
          // the access token provided by the OAuth flow. This fetches
          // additional fields (birthdays, phoneNumbers, addresses, etc.)
          // and attempts to merge them into `user.googleProfile` and the
          // existing `UserProfile` record (if present).
          try {
            if (accessToken) {
              const peopleUrl =
                "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays,phoneNumbers,addresses,genders,organizations,locales";
              const resp = await axios.get(peopleUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: 5000,
              });

              const people = resp.data;
              // Map a few useful fields into googleProfile
              try {
                // names[0]
                const names = people.names || [];
                if (names.length) {
                  const n = names[0];
                  user.googleProfile.name =
                    n.displayName || user.googleProfile.name;
                  user.googleProfile.given_name =
                    n.givenName || user.googleProfile.given_name;
                  user.googleProfile.family_name =
                    n.familyName || user.googleProfile.family_name;
                }

                // photos[0]
                const photos = people.photos || [];
                if (photos.length && photos[0].url) {
                  user.googleProfile.picture = photos[0].url;
                }

                // emailAddresses[0]
                const emails = people.emailAddresses || [];
                if (emails.length && emails[0].value) {
                  user.googleProfile.email = emails[0].value;
                }

                // birthdays -> try to pick a full date
                const birthdays = people.birthdays || [];
                if (birthdays.length) {
                  const bd = birthdays.find((b) => b.date && b.date.year);
                  const bdAny = bd || birthdays[0];
                  if (bdAny && bdAny.date) {
                    const { year, month, day } = bdAny.date;
                    if (year && month && day) {
                      // store as ISO date string
                      const dob = new Date(year, month - 1, day).toISOString();
                      user.googleProfile.dateOfBirth = dob;
                    }
                  }
                }

                // phoneNumbers
                const phones = people.phoneNumbers || [];
                if (phones.length && phones[0].value) {
                  user.googleProfile.phone = phones[0].value;
                }

                // addresses -> map to city/prefecture/country
                const addresses = people.addresses || [];
                if (addresses.length) {
                  const a = addresses[0];
                  if (a.city) user.googleProfile.city = a.city;
                  if (a.region) user.googleProfile.prefecture = a.region;
                  if (a.country) user.googleProfile.country = a.country;
                }
              } catch (mapErr) {
                logger &&
                  logger.warn &&
                  logger.warn(
                    "Error mapping People API fields:",
                    mapErr.message || mapErr,
                  );
              }

              // Save user (if any googleProfile fields changed)
              try {
                await user.save();
              } catch (saveErr) {
                logger &&
                  logger.warn &&
                  logger.warn(
                    "Could not save user after People API enrich:",
                    saveErr.message || saveErr,
                  );
              }

              // Merge into existing UserProfile (do not create new profile)
              try {
                const existingProfile = await UserProfile.findOne({
                  user: user._id,
                });
                if (existingProfile) {
                  let changed = false;
                  if (
                    !existingProfile.firstName &&
                    user.googleProfile.given_name
                  ) {
                    existingProfile.firstName = user.googleProfile.given_name;
                    changed = true;
                  }
                  if (
                    !existingProfile.lastName &&
                    user.googleProfile.family_name
                  ) {
                    existingProfile.lastName = user.googleProfile.family_name;
                    changed = true;
                  }
                  if (
                    !existingProfile.photoPath &&
                    user.googleProfile.picture
                  ) {
                    existingProfile.photoPath = user.googleProfile.picture;
                    changed = true;
                  }
                  if (
                    !existingProfile.dateOfBirth &&
                    user.googleProfile.dateOfBirth
                  ) {
                    existingProfile.dateOfBirth =
                      user.googleProfile.dateOfBirth;
                    changed = true;
                  }
                  if (!existingProfile.phone && user.googleProfile.phone) {
                    existingProfile.phone = user.googleProfile.phone;
                    changed = true;
                  }
                  if (!existingProfile.city && user.googleProfile.city) {
                    existingProfile.city = user.googleProfile.city;
                    changed = true;
                  }
                  if (changed) await existingProfile.save();
                }
              } catch (mergeErr) {
                logger &&
                  logger.warn &&
                  logger.warn(
                    "Could not merge People API data into UserProfile:",
                    mergeErr.message || mergeErr,
                  );
              }
            }
          } catch (err) {
            logger &&
              logger.warn &&
              logger.warn(
                "People API fetch failed (non-fatal):",
                err.message || err,
              );
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
