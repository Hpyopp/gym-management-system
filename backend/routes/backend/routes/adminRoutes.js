const express = require('express');
const router = express.Router();

// GET: Admin Dashboard Stats
router.get('/members', async (req, res) => {
  try {
    // Abhi ke liye ye dummy data bhej rahe hain taaki tera chart aur dashboard zinda ho jaye.
    // Baad mein hum isko MongoDB ke asli User model se link karenge.
    const mockChartData = [
      { month: 'Jan', subjects: 10, protocols: 8 },
      { month: 'Feb', subjects: 25, protocols: 20 },
      { month: 'Mar', subjects: 45, protocols: 38 },
      { month: 'Apr', subjects: 30, protocols: 28 },
    ];

    res.status(200).json({
      totalSubjects: 45,
      activeProtocols: 38,
      terminated: 7,
      chartData: mockChartData
    });
  } catch (error) {
    console.error("Admin Route Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;