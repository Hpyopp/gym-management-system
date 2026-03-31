const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // 3. Generate JWT Token
    // Payload mein hum user ka id, role, aur gymId daal rahe hain
    const token = jwt.sign(
      { id: user._id, role: user.role, gymId: user.gymId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Set HttpOnly Cookie (XSS Proof)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Vercel/Render ke liye
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 1 din
    });

    // 5. Send safe user data to frontend (password mat bhejna galti se bhi)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gymId: user.gymId
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error during login" });
  }
};

const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'none', secure: true });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { loginUser, logoutUser };