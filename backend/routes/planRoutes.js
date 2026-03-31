const express = require('express');
const router = express.Router();
const { getMyPlan } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

// Protect middleware lag gaya, bina token entry band
router.get('/my-plan/:userId', protect, getMyPlan);

module.exports = router;