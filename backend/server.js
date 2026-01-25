const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // This allows us to parse JSON data from the frontend

// Basic Route
app.get('/', (req, res) => {
  res.send('Backend Server is Running! 🚀');
});

app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Connect to MongoDB
console.log("URI Check:", process.env.MONGO_URI); // This should show your string (hide your password if sharing here!)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas ✅'))
  .catch((err) => console.error('MongoDB connection error ❌:', err));