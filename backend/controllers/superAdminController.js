const Gym = require('../models/Gym');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // 🔥 PASSWORD SECURITY 🔥

// 1. ENTERPRISE ENGINE: Real MRR Calculation
const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    let totalMRR = 0;
    let activeGyms = 0;

    const enrichedGyms = gyms.map(gym => {
      let planPrice = 0;
      const currentPlan = gym.plan || 'Starter';

      if (currentPlan === 'Starter') planPrice = 499;
      if (currentPlan === 'Pro') planPrice = 999;
      if (currentPlan === 'Elite') planPrice = 1499;

      if (gym.isActive) {
        totalMRR += planPrice;
        activeGyms += 1;
      }

      return { ...gym._doc, plan: currentPlan, planPrice };
    });

    const totalGyms = gyms.length;
    const suspendedGyms = totalGyms - activeGyms;

    const chartData = [
      { name: 'Nov', revenue: Math.round(totalMRR * 0.3) },
      { name: 'Dec', revenue: Math.round(totalMRR * 0.5) },
      { name: 'Jan', revenue: Math.round(totalMRR * 0.65) },
      { name: 'Feb', revenue: Math.round(totalMRR * 0.8) },
      { name: 'Mar', revenue: Math.round(totalMRR * 0.9) },
      { name: 'Apr', revenue: totalMRR },
    ];

    res.status(200).json({
      stats: { totalGyms, activeGyms, suspendedGyms, totalMRR },
      chartData,
      gyms: enrichedGyms
    });
  } catch (error) {
    console.error("Fetch Gyms Error:", error);
    res.status(500).json({ message: "Failed to fetch enterprise data" });
  }
};

// 2. THE KILL SWITCH: Toggle Gym Status
const toggleGymStatus = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.isActive = !gym.isActive; 
    await gym.save();

    res.status(200).json({ success: true, message: `Gym access ${gym.isActive ? 'RESTORED' : 'SUSPENDED'} successfully!`, gym });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ message: "Server error while toggling gym status" });
  }
};

// ==========================================
// 🚨 3. PROVISION TENANT (100% FIXED LOGIC) 🚨
// ==========================================
const createGym = async (req, res) => {
  try {
    // 🔥 Ab Modal se Email aur Password bhi aayega 🔥
    const { name, gymCode, ownerName, phone, plan, email, password } = req.body;
    
    // Check if Gym Code already exists
    const existingGym = await Gym.findOne({ gymCode });
    if (existingGym) return res.status(400).json({ message: "This Gym Code is already taken!" });

    // Check if Email already exists for any user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "This Email is already registered!" });

    if(!email || !password) return res.status(400).json({ message: "Admin Email and Password are required!" });

    // Hash the password securely before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step A: Create the Gym Tenant
    const newGym = await Gym.create({
      name, gymCode, ownerName, phone, plan: plan || 'Starter', isActive: true
    });

    // Step B: Create the Admin User Account so they can actually Login!
    await User.create({
      name: ownerName,
      email: email,
      password: hashedPassword,
      role: 'admin',      // 🔥 They get Admin rights 🔥
      gymCode: gymCode,   // Tied strictly to their new Gym
      phone: phone
    });

    res.status(201).json({ success: true, message: "Gym Created & Admin Credentials Generated!" });
  } catch (error) {
    console.error("Create Gym Error:", error);
    res.status(500).json({ message: "Failed to create new gym" });
  }
};

// 4. SPY MODE: Deep Insights
const getGymInsights = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    const memberCount = await User.countDocuments({ role: 'member', gymCode: gym.gymCode }); 
    const staffCount = await User.countDocuments({ role: 'staff', gymCode: gym.gymCode });   
    const simulatedEarnings = memberCount * 1500; 

    res.status(200).json({
      success: true,
      gymName: gym.name || 'Unnamed Gym',
      insights: { totalMembers: memberCount || 0, totalStaff: staffCount || 0, gymRevenue: simulatedEarnings || 0 }
    });
  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ message: "Failed to fetch gym insights" });
  }
};

// 5. UPDATE TENANT PLAN
const updateGymPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ['Starter', 'Pro', 'Elite'];
    if (!validPlans.includes(plan)) return res.status(400).json({ message: "Invalid plan selected" });

    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    gym.plan = plan;
    await gym.save();

    res.status(200).json({ success: true, message: `Plan updated to ${plan}` });
  } catch (error) {
    console.error("Update Plan Error:", error);
    res.status(500).json({ message: "Failed to update plan" });
  }
};

module.exports = { getAllGyms, toggleGymStatus, createGym, getGymInsights, updateGymPlan };