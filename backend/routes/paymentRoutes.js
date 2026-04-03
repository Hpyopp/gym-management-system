const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, razorpayWebhook } = require('../controllers/paymentController');

// 🔥 NEW: API to safely provide the PUBLIC Key ID to the frontend 🔥
router.get('/get-key', (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', razorpayWebhook);

module.exports = router;