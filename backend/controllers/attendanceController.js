const Attendance = require('../models/Attendance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getGymIdFromToken = (req) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.gymId || decoded.id;
};

exports.scanQR = async (req, res) => {
  try {
    const gymId = getGymIdFromToken(req);
    const { memberId } = req.body;

    // 1. Check kar ki kya yeh member is gym ka hai bhi ya nahi
    const member = await User.findOne({ _id: memberId, gymId, role: 'user' });
    if (!member) {
      return res.status(404).json({ message: "❌ Invalid QR: Member not found in this gym!" });
    }

    // 2. Expiry Date Check kar
    const isExpired = new Date(member.expiryDate) < new Date();
    if (isExpired) {
      return res.status(403).json({ 
        message: `⛔ ACCESS DENIED: ${member.name}'s plan is EXPIRED! Ask them to renew.`, 
        member 
      });
    }

    // 3. Double Entry Check (Ek din mein 2 baar scan na kare)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Aaj ki raat 12 baje se ab tak
    const alreadyMarked = await Attendance.findOne({
      memberId,
      createdAt: { $gte: today }
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: `⚠️ ${member.name} is already marked Present today.`, member });
    }

    // 4. Mark Attendance
    await Attendance.create({ gymId, memberId });
    res.status(200).json({ message: `✅ ACCESS GRANTED: ${member.name} marked Present.`, member });

  } catch (error) {
    console.error("Scanner Error:", error);
    res.status(500).json({ message: "Scanner Engine Error" });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const gymId = getGymIdFromToken(req);
    const records = await Attendance.find({ gymId }).populate('memberId', 'name phone').sort({ createdAt: -1 }).limit(100);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};