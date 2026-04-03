const User = require('../models/User');
const Gym = require('../models/Gym');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken'); 

const getGymIdFromToken = (req) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized: Token missing');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.gymId || decoded.id;
};

// 1. Dashboard Stats (WITH EXPIRY ENGINE & CHART DATA 🔥)
const getAdminStats = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    
    const totalMembers = await User.countDocuments({ gymId: adminGymId, role: 'user' });
    const currentDate = new Date();
    const activeMembers = await User.countDocuments({ gymId: adminGymId, role: 'user', expiryDate: { $gte: currentDate } });
    const expiredMembers = await User.countDocuments({ gymId: adminGymId, role: 'user', expiryDate: { $lt: currentDate } });

    // 🔥 EXPIRY ENGINE
    let currentPlan = 'Free Trial';
    const activeSubscription = await Subscription.findOne({ gymId: adminGymId, status: 'Active' }).sort({ createdAt: -1 });

    if (activeSubscription) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const paymentDate = new Date(activeSubscription.createdAt);

      if (paymentDate < thirtyDaysAgo) {
        activeSubscription.status = 'Expired';
        await activeSubscription.save();
        currentPlan = 'Free Trial'; 
      } else {
        currentPlan = activeSubscription.planName;
      }
    }

    // 🔥 GRAPH DATA ENGINE (Pichle 6 mahine ka live data)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = monthNames[d.getMonth()];
      
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const joins = await User.countDocuments({
        gymId: adminGymId,
        role: 'user',
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });

      chartData.push({ name: monthLabel, joins });
    }

    res.status(200).json({ 
      totalMembers, 
      activeMembers, 
      expiredMembers, 
      currentPlan,
      chartData // Graph ka data bhej diya
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Server Error fetching stats", error: error.message });
  }
};

// 2. Member List Data
const getAdminMembers = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    const members = await User.find({ gymId: adminGymId, role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// 3. Add Member
const addMember = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    const { name, phone, age, weight, planDuration } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Phone number already exists in system!" });

    let monthsToAdd = 1;
    if (typeof planDuration === 'string') monthsToAdd = parseInt(planDuration.split(' ')[0]) || 1;
    
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

    const dummyEmail = `${phone}@member.com`;
    const defaultPassword = phone; 

    const newMember = await User.create({
      name, phone, email: dummyEmail, password: defaultPassword, 
      age, currentWeight: weight, role: 'user', gymId: adminGymId, expiryDate, isActive: true, walletBalance: 0
    });

    res.status(201).json({ success: true, message: "Member added successfully!", member: newMember });
  } catch (error) {
    res.status(500).json({ message: "Failed to add member" });
  }
};

// 4. Update Member
const updateMember = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    const { id } = req.params;
    const updatedUser = await User.findOneAndUpdate({ _id: id, gymId: adminGymId, role: 'user' }, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ success: true, message: "Member updated!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update member" });
  }
};

// 5. Delete Member
const deleteMember = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    const { id } = req.params;
    const deletedUser = await User.findOneAndDelete({ _id: id, gymId: adminGymId, role: 'user' });
    if (!deletedUser) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ success: true, message: "Member deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete member" });
  }
};

// 6. Update Wallet
const updateWallet = async (req, res) => {
  try {
    const adminGymId = getGymIdFromToken(req);
    const { id } = req.params;
    const { amount, actionType } = req.body; 

    const user = await User.findOne({ _id: id, gymId: adminGymId, role: 'user' });
    if (!user) return res.status(404).json({ message: "Member not found" });

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return res.status(400).json({ message: "Invalid amount" });

    if (actionType === 'add') user.walletBalance += value;
    else if (actionType === 'deduct') user.walletBalance -= value;
    else return res.status(400).json({ message: "Invalid action type" });

    await user.save();
    res.status(200).json({ success: true, message: "Wallet updated successfully!", balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wallet" });
  }
};

module.exports = { getAdminStats, getAdminMembers, addMember, updateMember, deleteMember, updateWallet };