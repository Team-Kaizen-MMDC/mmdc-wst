const express = require('express');
const router = express.Router();
const User = require('../models/user.js'); // Import our Blueprint

// POST: /api/auth/signup
router.post('/signup', async (req, res) => {
    console.log("Data received:", req.body); // This line prints to your terminal
  try {
    const { email, password } = req.body;

    // Create a new user instance
    const newUser = new User({ email, password });

    // Save to MongoDB (the hashing happens automatically in the model!)
    await newUser.save();

    res.status(201).json({ 
      message: "Account created successfully! 🎉",
      userId: newUser._id 
    });
  } catch (error) {
    // Handle errors (like duplicate emails)
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;