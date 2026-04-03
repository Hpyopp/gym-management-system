const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// 1. Gym Owner Naya Staff Banayega
exports.addStaff = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const gymId = decoded.gymId || decoded.id; 

    const { name, email, password } = req.body;
    
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) return res.status(400).json({ message: "Email already in use!" });

    const newStaff = await Staff.create({ gymId, name, email, password, role: 'staff' });
    
    res.status(201).json({ message: "Staff account created successfully", staff: newStaff });
  } catch (error) {
    res.status(500).json({ message: "Error creating staff", error: error.message });
  }
};

// 2. Staff Asli Login Karega
exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email });
    
    if (!staff || staff.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Token mein hum explicitly role 'staff' daal rahe hain taaki frontend ko pata chale yeh naukar hai, maalik nahi
    const token = jwt.sign(
      { id: staff._id, gymId: staff.gymId, role: staff.role, name: staff.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ message: "Staff Login Successful", token, role: staff.role, name: staff.name });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// 3. Admin apne staff ki list dekh sake
exports.getStaffList = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const gymId = decoded.gymId || decoded.id;

    const staffList = await Staff.find({ gymId }).select('-password');
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff" });
  }
};