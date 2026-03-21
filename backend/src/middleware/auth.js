const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

/**
 * Protect routes - verify JWT token
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. Check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ApiError(401, "User not found"));
    }

    // Check if user is active
    if (!req.user.isActive) {
      return next(new ApiError(401, "Account is deactivated"));
    }

    // Check if account is locked
    if (req.user.isLocked) {
      return next(
        new ApiError(
          401,
          "Account is locked due to multiple failed login attempts",
        ),
      );
    }

    next();
  } catch (err) {
    return next(new ApiError(401, "Not authorized to access this route"));
  }
});

/**
 * Grant access to specific roles
 * @param {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user.role}' is not authorized to access this route`,
        ),
      );
    }
    next();
  };
};
