const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { superAdminLogin, superAdminLogout, getAllGyms, createGym } = require('../controllers/superAdminController');

// Middleware to protect routes via Cookie
const verifySuperAdmin = (req, res, next) => {
  const token = req.cookies.superAdminToken;
  if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided!" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role !== 'superadmin') throw new Error("Not SuperAdmin");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// Open Routes (Login/Logout)
router.post('/login', superAdminLogin);
router.post('/logout', superAdminLogout);

// Protected Routes (Yahan middleware laga hai)
router.get('/gyms', verifySuperAdmin, getAllGyms);
router.post('/gyms', verifySuperAdmin, createGym);

module.exports = router;