const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
