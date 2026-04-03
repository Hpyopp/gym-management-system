const Razorpay = require('razorpay');
const crypto = require('crypto');
const Gym = require('../models/Gym');

// ==========================================
// 🚨 CRITICAL: STRICT ENV CHECKS 🚨
// ==========================================
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.error("FATAL ERROR: Razorpay keys are missing in .env file.");
  // Production mein yahan process.exit(1) lagate hain, par server crash na ho isliye warning chhod raha hu
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// ==========================================
// 1. CREATE ORDER
// ==========================================
const createOrder = async (req, res) => {
  try {
    const { planType, gymId } = req.body;
    let amount = 0;

    if (planType === 'Pro') amount = 999;
    if (planType === 'Elite') amount = 1499;
    
    if (amount === 0) return res.status(400).json({ message: "Invalid Plan" });

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `rcpt_${gymId}_${Math.floor(Math.random() * 1000)}`,
      notes: { gymId, planType } 
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Server error during order creation" });
  }
};

// ==========================================
// 2. FRONTEND VERIFY (Instant UI Update)
// ==========================================
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gymId, newPlan } = req.body;
    
    // Strict env usage
    const secret = process.env.RAZORPAY_SECRET;
    if (!secret) return res.status(500).json({ message: "Server Configuration Error" });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

    if (expectedSignature === razorpay_signature) {
      const gym = await Gym.findById(gymId);
      if (gym && gym.plan !== newPlan) {
        gym.plan = newPlan;
        await gym.save();
      }
      res.status(200).json({ success: true, message: `Upgraded to ${newPlan}!` });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature!" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// ==========================================
// 3. SECURE WEBHOOK (Runs in background)
// ==========================================
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(500).json({ message: "Webhook secret missing on server" });

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');

    if (expectedSignature !== signature) {
      console.warn("⚠️ UNAUTHORIZED WEBHOOK ATTEMPT DETECTED");
      return res.status(400).json({ message: "Invalid Signature" });
    }

    if (req.body.event === 'payment.captured' || req.body.event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const gymId = paymentEntity.notes.gymId;
      const planType = paymentEntity.notes.planType;

      if (gymId && planType) {
        const gym = await Gym.findById(gymId);
        if (gym && gym.plan !== planType) {
          gym.plan = planType;
          await gym.save();
          console.log(`✅ WEBHOOK SUCCESS: Gym ${gym.name} securely upgraded to ${planType}`);
        }
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    res.status(500).json({ message: "Webhook failed" });
  }
};

module.exports = { createOrder, verifyPayment, razorpayWebhook };