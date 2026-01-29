const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const bcrypt = require("bcryptjs");

/**
 * @desc    Get all users (with pagination and filtering)
 * @route   GET /api/v1/users
 * @access  Private (admin only)
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { role, isActive, page = 1, limit = 20, search } = req.query;

  const query = {};

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  // Search by email
  if (search) {
    query.email = { $regex: search, $options: "i" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select("-password")
    .populate("profile", "firstName lastName nationality japaneseLevel")
    .populate("company", "name industry")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json(
    new ApiResponse(200, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }),
  );
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (self or admin)
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("profile")
    .populate("company", "name industry logo");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Check authorization (user can view own profile or admin can view any)
  if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Not authorized to view this user"));
  }

  res.json(new ApiResponse(200, user));
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (self or admin)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { email, role, isActive, company } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Check authorization
  const isSelf = req.user._id.toString() === user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return next(new ApiError(403, "Not authorized to update this user"));
  }

  // Only admins can update role, isActive, and company
  if (!isAdmin && (role || isActive !== undefined || company)) {
    return next(
      new ApiError(403, "Not authorized to update these fields"),
    );
  }

  // Update email if provided and different
  if (email && email !== user.email) {
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "Email already in use"));
    }
    user.email = email;
    user.isEmailVerified = false; // Reset verification if email changes
  }

  // Admin-only updates
  if (isAdmin) {
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (company) user.company = company;
  }

  await user.save();

  // Return user without password
  const updatedUser = await User.findById(user._id).select("-password");

  res.json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (admin only)
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Soft delete by setting isActive to false
  user.isActive = false;
  await user.save();

  // Also soft delete associated profile
  if (user.profile) {
    await UserProfile.findByIdAndUpdate(user.profile, { isActive: false });
  }

  res.json(new ApiResponse(200, null, "User deleted successfully"));
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/users/update-password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new ApiError(400, "Please provide current password and new password"),
    );
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError(401, "Current password is incorrect"));
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return next(
      new ApiError(400, "New password must be at least 8 characters long"),
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.getSignedJwtToken();

  res.json(
    new ApiResponse(
      200,
      { token },
      "Password updated successfully",
    ),
  );
});
