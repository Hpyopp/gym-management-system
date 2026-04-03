const User = require('../models/User');
const Gym = require('../models/Gym');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. LOGIN LOGIC (FIXED WITH LEGACY FALLBACK)
// ==========================================
const loginUser = async (req, res) => {
  try {
    // Frontend chahe 'email' bheje ya 'phone', hum dono handle karenge
    const identifier = req.body.email || req.body.phone;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide both Email/Phone and Password." });
    }

    // Check if user exists by Email OR Phone
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });
    
    if (!user) return res.status(404).json({ message: "User not found! Check your details." });

    // 🔥 THE MASTER FIX: Handle both Hashed and Plain-Text Passwords 🔥
    let isMatch = false;
    
    // Check if the saved password looks like a bcrypt hash (starts with $2)
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy Fallback: If it's not hashed (old accounts), do a direct string match
      isMatch = (password === user.password);
    }

    if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

    // Admin has 'gymCode', Members have 'gymId'. Safely fetch the Gym.
    let gym = null;
    if (user.gymId) {
      gym = await Gym.findById(user.gymId);
    } else if (user.gymCode) {
      gym = await Gym.findOne({ gymCode: user.gymCode });
    }

    // THE MASTER KILL SWITCH BLOCKER
    if (gym && gym.isActive === false) {
      return res.status(403).json({ 
        message: "ACCESS DENIED: Your Gym's software subscription is SUSPENDED. Please contact GymOS Support." 
      });
    }

    // Generate Secure Token
    const token = jwt.sign(
      { id: user._id, role: user.role, gymId: user.gymId || gym?._id, gymCode: user.gymCode || gym?.gymCode },
      process.env.JWT_SECRET || 'gymos_secret_123', // Fallback for safety
      { expiresIn: '1d' }
    );

    // Set Cookie
    res.cookie('token', token, {
      httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 
    });

    // Send Success Response
    res.status(200).json({
      success: true, 
      message: "Login successful", 
      token: token,
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        gymId: user.gymId || gym?._id, 
        gymCode: user.gymCode || gym?.gymCode 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error during Login" });
  }
};

// ==========================================
// 2. LOGOUT LOGIC
// ==========================================
const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true });
  res.status(200).json({ message: "Logged out successfully" });
};

// ==========================================
// 3. REGISTRATION LOGIC
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { gymCode, name, phone, password, weight, age, gender, medicalHistory, duration } = req.body;

    const gym = await Gym.findOne({ gymCode });
    if (!gym) return res.status(404).json({ message: "Invalid Gym Invite Code!" });

    // Stop new registrations if Gym is suspended
    if (gym.isActive === false) return res.status(403).json({ message: "Gym subscription suspended. Cannot register." });

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Phone number already registered!" });

    // Hash the password for new members!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const dummyEmail = `${phone}@member.com`;
    let expiry = new Date();
    if (duration === '1_month') expiry.setMonth(expiry.getMonth() + 1);
    else if (duration === '3_months') expiry.setMonth(expiry.getMonth() + 3);
    else if (duration === '6_months') expiry.setMonth(expiry.getMonth() + 6);
    else if (duration === '1_year') expiry.setFullYear(expiry.getFullYear() + 1);

    const newUser = await User.create({
      name, email: dummyEmail, phone, password: hashedPassword, role: 'user', gymId: gym._id, gymCode: gymCode,
      currentWeight: weight, age, gender, medicalHistory, expiryDate: expiry, isActive: true
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, gymId: newUser.gymId, gymCode: newUser.gymCode },
      process.env.JWT_SECRET || 'gymos_secret_123', 
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, token, _id: newUser._id });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Backend Crash during Registration" });
  }
};

module.exports = { loginUser, logoutUser, registerUser };