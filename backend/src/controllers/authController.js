const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const logger = require("../utils/logger");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register user (local email + password)
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User already exists with this email"));
  }

  const allowedRoles = ["jobseeker", "employer"];
  if (role && !allowedRoles.includes(role)) {
    return next(new ApiError(400, 'Invalid role. Use "jobseeker" or "employer"'));
  }

  const user = await User.create({
    email,
    password,
    role: role || "jobseeker",
    authProvider: "local",
  });

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
 * Login user (local email + password)
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ApiError(401, "Invalid credentials"));
  }

  if (user.isLocked) {
    return next(
      new ApiError(
        401,
        "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      ),
    );
  }

  if (!user.isActive) {
    return next(new ApiError(401, "Account has been deactivated"));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    await user.incLoginAttempts();
    return next(new ApiError(401, "Invalid credentials"));
  }

  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  user.lastLogin = Date.now();
  await user.save();

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
 * Login/Register user via Google ID token
 */
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new ApiError(400, "Google credential is required"));
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return next(new ApiError(500, "GOOGLE_CLIENT_ID is not configured"));
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    logger.warn("Google ID token verification failed", { error: err?.message });
    return next(new ApiError(401, "Invalid Google token"));
  }

  const googleId = payload?.sub;
  const email = payload?.email;
  const emailVerified = payload?.email_verified;

  if (!googleId || !email) {
    return next(new ApiError(401, "Invalid Google token payload"));
  }

  if (!emailVerified) {
    return next(new ApiError(401, "Google email is not verified"));
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      role: "jobseeker",
      authProvider: "google",
      googleId,
      isEmailVerified: true,
      lastLogin: Date.now(),
    });

    logger.info(`New Google user created: ${email}`);
  } else {
    if (!user.isActive) {
      return next(new ApiError(401, "Account has been deactivated"));
    }

    user.authProvider = "google";
    user.googleId = googleId;
    user.isEmailVerified = true;
    user.lastLogin = Date.now();
    await user.save();

    logger.info(`Google user logged in: ${email}`);
  }

  const token = user.getSignedJwtToken();

  res.status(200).json(
    new ApiResponse(200, "Google login successful", {
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
 * Get current user
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("profile")
    .populate("company");

  res.status(200).json(
    new ApiResponse(200, "User retrieved successfully", { user }),
  );
});

/**
 * Logout user
 */
exports.logout = asyncHandler(async (req, res, next) => {
  logger.info(`User logged out: ${req.user?.email || "unknown"}`);
  res.status(200).json(new ApiResponse(200, "Logout successful", null));
});

/**
 * Forgot password (stub)
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  res
    .status(501)
    .json(new ApiResponse(501, "Password reset functionality coming soon", null));
});
