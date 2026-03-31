const Gym = require('../models/Gym');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. LOGIN API: Master Key check karke Cookie set karega
const superAdminLogin = async (req, res) => {
  const { masterKey } = req.body;
  if (masterKey !== process.env.MASTER_KEY) {
    return res.status(401).json({ message: "Invalid Master Key!" });
  }

  // Generate JWT Token
  const token = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Set HttpOnly Cookie (XSS Proof)
  res.cookie('superAdminToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Vercel pe true hona chahiye
    sameSite: 'none', // Cross-domain (Render to Vercel) ke liye zaroori
    maxAge: 24 * 60 * 60 * 1000 
  });

  res.status(200).json({ success: true, message: "System Unlocked" });
};

// 2. LOGOUT API: Cookie destroy karega
const superAdminLogout = (req, res) => {
  res.cookie('superAdminToken', '', { httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true });
  res.status(200).json({ message: "System Locked" });
};

// 3. GET GYMS: Cookie validation ke baad chalega
const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    res.status(200).json(gyms);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" }); // No DB error leak
  }
};

// 4. CREATE GYM & ADMIN: Cookie validation ke baad chalega
const createGym = async (req, res) => {
  try {
    const { gymName, gymCode, ownerName, email, password, contactPhone } = req.body;

    const existingGym = await Gym.findOne({ gymCode });
    const existingUser = await User.findOne({ email });
    if (existingGym || existingUser) {
      return res.status(400).json({ message: "Gym Code or Email already exists!" });
    }

    const newGym = await Gym.create({ gymName, gymCode, ownerName, contactPhone });

    await User.create({
      name: ownerName,
      email: email,
      password: password, // Ab ye automatically Model mein hash ho jayega
      role: 'admin',
      gymId: newGym._id, 
      phone: contactPhone,
      isActive: true
    });

    res.status(201).json({ success: true, message: "Gym and Admin Created!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error during deployment" });
  }
};

module.exports = { superAdminLogin, superAdminLogout, getAllGyms, createGym };