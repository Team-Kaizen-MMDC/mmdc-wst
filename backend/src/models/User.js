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

    /**
     * authProvider tells us how the user authneticates:
     * - "local" : normal email/password login
     * - "google" : Google Sign-in login (no password needed)
     * 
     * This makes it easy to support multiple auth methods safely
     */

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      index: true,
    },

    /**
     * googleId stores the unique Google user ID (payload.sub)
     * We keep it optional because local users won't have it.
     */

    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple docs to have null without unique/index issues
    },

    /**
     * Password is only required for local auth users. For Google auth users, it can be null and won't be used.
     */
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't return password by default
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

    /**
     * For Google sign in, email is already verified by Google
     * so we can safely set this to tru when creating/logging-in Google users
     */
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

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
// Hash password before saving - Mongoose 8.x async/await style (no next callback)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
// For Google accounts (no password stored), return false
userSchema.methods.comparePassword = async function (candidatePassword) {
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
