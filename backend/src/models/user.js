const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true 
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'User'
  },
  status: {
    type: String,
    default: 'Active'
  },
  // "Skip and Fill Later" arrays
  profile: [],
  experience: [],
  education: [],
  skills: [],
  contact: [],
  availability: [],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Updated Middleware in models/user.js
userSchema.pre('save', async function () {
  // Only hash the password if it's new or being changed
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt); 
    // In an async function, simply returning or finishing is enough!
  } catch (error) {
    throw error; // Throwing the error will stop the save
  }
});

// 📤 Export the model (Must be at the very bottom!)
module.exports = mongoose.model('User', userSchema);