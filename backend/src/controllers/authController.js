const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/User");
const logger = require("../utils/logger");

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

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(new ApiError(401, "Invalid credentials"));
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
