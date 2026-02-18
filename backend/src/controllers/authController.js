const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const logger = require("../utils/logger");
const { verifyGoogleToken } = require("../utils/googleAuth");

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User already exists with this email"));
  }

  // Validate role (only allow jobseeker and employer during registration)
  const allowedRoles = ["jobseeker", "employer"];
  if (role && !allowedRoles.includes(role)) {
    return next(
      new ApiError(400, 'Invalid role. Use "jobseeker" or "employer"'),
    );
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role: role || "jobseeker",
  });

  // Generate token
  const token = user.getSignedJwtToken();

  logger.info(`New user registered: ${email}`);

  res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    }),
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  // Find user (include password field)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(
      new ApiError(
        401,
        "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      ),
    );
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new ApiError(401, "Account has been deactivated"));
  }

  // If this account is an OAuth (Google) account with no password,
  // instruct the client to sign in via Google instead of password.
  if (user.authProvider === "google" && !user.password) {
    return next(
      new ApiError(
        401,
        "This account is linked to Google. Please sign in using Google Sign-In.",
      ),
    );
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(new ApiError(401, "Invalid credentials"));
  }

  // If this account is an OAuth (Google) account with no password,
  // instruct the client to sign in via Google instead of password.
  if (user.authProvider === "google" && !user.password) {
    return next(
      new ApiError(
        401,
        "This account is linked to Google. Please sign in using Google Sign-In.",
      ),
    );
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate token
  const token = user.getSignedJwtToken();

  logger.info(`User logged in: ${email}`);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    }),
  );
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("profile")
    .populate("company");

  res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", { user }));
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // Since we're using JWT (stateless), logout is handled client-side
  // by removing the token. This endpoint is mainly for logging purposes.

  logger.info(`User logged out: ${req.user.email}`);

  res.status(200).json(new ApiResponse(200, "Logout successful", null));
});

/**
 * @desc    Forgot password (stub for future implementation)
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // TODO: Implement password reset functionality
  res
    .status(501)
    .json(
      new ApiResponse(501, "Password reset functionality coming soon", null),
    );
});

/**
 * @desc    Authenticate with Google OAuth (ID token)
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
exports.googleAuth = asyncHandler(async (req, res, next) => {
  const { googleToken, role } = req.body;

  if (!googleToken) {
    return next(new ApiError(400, "googleToken is required"));
  }

  // Verify token with Google
  let payload;
  try {
    payload = await verifyGoogleToken(googleToken);
  } catch (err) {
    // Log underlying verification error for easier debugging in dev
    logger &&
      logger.error &&
      logger.error("Google token verification error:", err.message || err);
    return next(new ApiError(401, "Invalid Google token"));
  }

  const email = payload.email;
  const googleId = payload.sub;
  const profile = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    given_name: payload.given_name,
    family_name: payload.family_name,
    picture: payload.picture,
    locale: payload.locale,
  };

  // Find existing user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // If user exists but is a local account, ask to link or sign in with password
    if (user.authProvider === "local" && !user.googleId) {
      return next(
        new ApiError(
          400,
          "An account with this email already exists. Please sign in with your password and link Google from account settings.",
        ),
      );
    }

    // Update google fields if needed
    user.googleId = googleId;
    user.googleProfile = profile;
    user.authProvider = "google";
    await user.save();
  } else {
    // Create a new user for Google-authenticated user
    user = await User.create({
      email,
      role: role || "jobseeker",
      authProvider: "google",
      googleId,
      googleProfile: profile,
    });
  }

  // If a UserProfile already exists for this user, merge Google fields into it
  try {
    const existingProfile = await UserProfile.findOne({ user: user._id });
    if (existingProfile) {
      let changed = false;
      if (!existingProfile.firstName && profile.given_name) {
        existingProfile.firstName = profile.given_name;
        changed = true;
      }
      if (!existingProfile.lastName && profile.family_name) {
        existingProfile.lastName = profile.family_name;
        changed = true;
      }
      // Save avatar URL into photoPath if not set
      if (!existingProfile.photoPath && profile.picture) {
        existingProfile.photoPath = profile.picture;
        changed = true;
      }
      if (changed) await existingProfile.save();
    }
  } catch (err) {
    logger &&
      logger.warn &&
      logger.warn(
        "Could not merge Google profile into UserProfile:",
        err.message || err,
      );
  }

  // Generate JWT for the user
  const token = user.getSignedJwtToken();

  logger.info(`User authenticated via Google: ${email}`);

  res.status(200).json(
    new ApiResponse(200, "Authentication successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    }),
  );
});

/**
 * @desc    Start Google OAuth consent flow (redirect URL)
 * @route   GET /auth/google/start
 * @access  Public
 */
exports.googleStart = asyncHandler(async (req, res, next) => {
  const { OAuth2Client } = require("google-auth-library");
  const axios = require("axios");
  const UserProfile = require("../models/UserProfile");
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/v1/auth/google/callback",
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent",
  });

  // Redirect the user to Google's consent screen
  res.redirect(url);
});

/**
 * @desc    OAuth callback: exchange code for tokens and return id_token
 * @route   GET /auth/google/callback
 * @access  Public
 */
exports.googleCallback = asyncHandler(async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return next(new ApiError(400, "Missing code parameter"));
  }

  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/v1/auth/google/callback",
  );

  try {
    const r = await client.getToken(code);
    const tokens = r.tokens || r; // google-auth-library returns { tokens }

    // Extract tokens
    const idToken = tokens.id_token;
    const accessToken = tokens.access_token;

    // Verify id_token to get the payload
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      // If verify fails, still return tokens for debugging
      logger &&
        logger.warn &&
        logger.warn(
          "ID token verification failed in googleCallback:",
          err.message || err,
        );
      return res.status(200).json({ success: true, tokens });
    }

    const email = payload.email;
    const googleId = payload.sub;
    const profileObj = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      locale: payload.locale,
    };

    // Find or create user similar to googleAuth flow
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (user.authProvider === "local" && !user.googleId) {
        // Existing local account — advise linking instead of automatic takeover
        logger &&
          logger.info &&
          logger.info(
            `Local account exists for ${email}; skipping automatic link`,
          );
        // Still set google fields if not present
        user.googleId = user.googleId || googleId;
        user.googleProfile = { ...user.googleProfile, ...profileObj };
        user.authProvider = "google";
        try {
          await user.save();
          logger.info(
            `Linked Google to existing local user: ${user.email} (${user._id})`,
          );
        } catch (saveErr) {
          logger.error(
            `Failed linking Google to user ${email}: ${saveErr.message || saveErr}`,
          );
          throw saveErr;
        }
      } else {
        user.googleId = googleId;
        user.googleProfile = { ...user.googleProfile, ...profileObj };
        user.authProvider = "google";
        user.lastLogin = Date.now();
        try {
          await user.save();
          logger.info(`Updated Google user: ${user.email} (${user._id})`);
        } catch (saveErr) {
          logger.error(
            `Failed updating Google user ${email}: ${saveErr.message || saveErr}`,
          );
          throw saveErr;
        }
      }
    } else {
      try {
        user = await User.create({
          email,
          role: req.session?.pendingRole || "jobseeker",
          authProvider: "google",
          googleId,
          googleProfile: profileObj,
          isEmailVerified: true,
          lastLogin: Date.now(),
        });
        logger.info(
          `Created user in googleCallback: ${user.email} (${user._id})`,
        );
      } catch (createErr) {
        logger.error(
          `Failed to create user in googleCallback for ${email}: ${createErr.message || createErr}`,
        );
        throw createErr;
      }
    }

    // Enrich via People API if we have an access token
    try {
      if (accessToken) {
        const peopleUrl =
          "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays,phoneNumbers,addresses,genders,organizations,locales";
        const resp = await axios.get(peopleUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        });
        const people = resp.data || {};
        const names = people.names || [];
        if (names.length) {
          const n = names[0];
          user.googleProfile.name = n.displayName || user.googleProfile.name;
          user.googleProfile.given_name =
            n.givenName || user.googleProfile.given_name;
          user.googleProfile.family_name =
            n.familyName || user.googleProfile.family_name;
        }
        const photos = people.photos || [];
        if (photos.length && photos[0].url)
          user.googleProfile.picture = photos[0].url;
        const emails = people.emailAddresses || [];
        if (emails.length && emails[0].value)
          user.googleProfile.email = emails[0].value;
        const birthdays = people.birthdays || [];
        if (birthdays.length) {
          const bd =
            birthdays.find((b) => b.date && b.date.year) || birthdays[0];
          if (bd && bd.date) {
            const { year, month, day } = bd.date;
            if (year && month && day)
              user.googleProfile.dateOfBirth = new Date(
                year,
                month - 1,
                day,
              ).toISOString();
          }
        }
        const phones = people.phoneNumbers || [];
        if (phones.length && phones[0].value)
          user.googleProfile.phone = phones[0].value;
        const addresses = people.addresses || [];
        if (addresses.length) {
          const a = addresses[0];
          if (a.city) user.googleProfile.city = a.city;
          if (a.region) user.googleProfile.prefecture = a.region;
          if (a.country) user.googleProfile.country = a.country;
        }
        await user.save();

        // Merge into existing UserProfile if present
        try {
          const existingProfile = await UserProfile.findOne({ user: user._id });
          if (existingProfile) {
            let changed = false;
            if (!existingProfile.firstName && user.googleProfile.given_name) {
              existingProfile.firstName = user.googleProfile.given_name;
              changed = true;
            }
            if (!existingProfile.lastName && user.googleProfile.family_name) {
              existingProfile.lastName = user.googleProfile.family_name;
              changed = true;
            }
            if (!existingProfile.photoPath && user.googleProfile.picture) {
              existingProfile.photoPath = user.googleProfile.picture;
              changed = true;
            }
            if (
              !existingProfile.dateOfBirth &&
              user.googleProfile.dateOfBirth
            ) {
              existingProfile.dateOfBirth = user.googleProfile.dateOfBirth;
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
              "Could not merge People API data into UserProfile (callback):",
              mergeErr.message || mergeErr,
            );
        }
      }
    } catch (peopleErr) {
      logger &&
        logger.warn &&
        logger.warn(
          "People API fetch failed in googleCallback (non-fatal):",
          peopleErr.message || peopleErr,
        );
    }

    // Generate JWT and set cookies for frontend
    const jwtToken = user.getSignedJwtToken();
    req.session.authToken = jwtToken;
    req.session.user = { id: user._id, email: user.email, role: user.role };
    res.cookie("isLoggedIn", "true", {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.cookie("email", user.email, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.cookie("token", jwtToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Redirect to dashboard with token query param
    const redirectUrl = "/pages/profileDashboard.html";
    const separator = redirectUrl.includes("?") ? "&" : "?";
    return res.redirect(`${redirectUrl}${separator}token=${jwtToken}`);
  } catch (err) {
    return next(new ApiError(500, "Failed to exchange code for tokens"));
  }
});
