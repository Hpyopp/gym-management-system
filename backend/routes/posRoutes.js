const express = require('express');
const router = express.Router();
const { getPosData, generateBill } = require('../controllers/posController');

// GET: Products aur Gym Wallet ka data laane ke liye naya route
router.get('/data', getPosData);

// POST: Bill banane aur wallet se paisa kaatne ka route
router.post('/generate-bill', generateBill);

module.exports = router;