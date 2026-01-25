const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcrypt');

// ==========================================
// POST: /api/auth/signup
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ 
      message: "Account created successfully! 🎉",
      userId: newUser._id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// POST: /api/auth/signin
// ==========================================
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // 📝 Add this log to see what the frontend is sending
    console.log("Login attempt for:", email);

    try {
        // Now 'await' is valid because it's inside an 'async' function!
        const user = await User.findOne({ email });
        
        if (!user) {
          console.log(" User not found in database"); // 📝 Add this
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("User found. Comparing passwords..."); // 📝 Add this

     // 2. Check password using bcrypt
const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
    console.log("Password does not match hash");
    return res.status(401).json({ message: "Invalid email or password" });
}

console.log("✅ Password matches! Logging in...");

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email
                // Note: Ensure your User model has a 'username' field if you want to send it
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;