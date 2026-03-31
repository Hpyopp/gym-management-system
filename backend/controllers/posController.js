const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Gym = require('../models/Gym');

// GET: Products and Gym Wallet Info
const getPosData = async (req, res) => {
  try {
    const gymId = req.query.gymId; // Testing ke liye query se le rahe hain
    const products = await Product.find({ isActive: true });
    const gym = await Gym.findById(gymId).select('walletBalance gymName totalSales');
    res.status(200).json({ products, gym });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch POS data" });
  }
};

// POST: Generate Bill & Deduct Wallet
const generateBill = async (req, res) => {
  try {
    const { gymId, customerName, items, paymentMode } = req.body;

    let totalMrp = 0; // Customer ka bill
    let totalGymCost = 0; // Jo wallet se katega
    const processedItems = [];

    // STEP 1: Calculation
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock issue with ${product?.name}` });
      }

      totalMrp += product.mrp * item.quantity;
      totalGymCost += product.gymPrice * item.quantity;

      processedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.mrp, // Bill pe MRP dikhega
        total: product.mrp * item.quantity
      });
    }

    // STEP 2: Wallet Check (The Bouncer)
    const gym = await Gym.findById(gymId);
    if (gym.walletBalance < totalGymCost) {
      return res.status(400).json({ 
        message: `Insufficient Wallet Balance! Cost is ₹${totalGymCost}, but wallet only has ₹${gym.walletBalance}. Please Recharge.` 
      });
    }

    // STEP 3: Deduct Wallet & Update Stock
    await Gym.findByIdAndUpdate(gymId, { 
      $inc: { 
        walletBalance: -totalGymCost, // Paisa kat gaya
        totalSales: totalMrp // Leaderboard rank badh gayi
      } 
    });

    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    // STEP 4: Save Invoice
    const invoice = await Invoice.create({
      gymId, customerName, items: processedItems,
      subTotal: totalMrp, tax: 0, grandTotal: totalMrp, // Simplifying tax for now
      paymentMode
    });

    res.status(201).json({ success: true, invoice, deductedAmount: totalGymCost });

  } catch (error) {
    console.error("Billing Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getPosData, generateBill };