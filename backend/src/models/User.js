const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      // Password is not strictly required at the schema level because
      // OAuth users will not have a password. Registration endpoint
      // enforces password presence for local signups.
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    // Authentication provider: 'local' (email/password) or 'google'
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    // Google-specific fields
    googleId: {
      type: String,
    },
    googleProfile: {
      id: String,
      email: String,
      name: String,
      given_name: String,
      family_name: String,
      picture: String,
      locale: String,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin", "rso"],
      default: "jobseeker",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes (email index is auto-created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ authProvider: 1 });

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving — only when password is present and modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return; // nothing to hash for OAuth users

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If user doesn't have a password (OAuth user), always return false
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const needsLock = this.loginAttempts + 1 >= 5 && !this.isLocked;

  if (needsLock) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

module.exports = mongoose.model("User", userSchema);
