const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

const getGymId = (req) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error("Unauthorized");
  return jwt.verify(token, process.env.JWT_SECRET).gymId;
};

exports.getProducts = async (req, res) => {
  try {
    const gymId = getGymId(req);
    const products = await Product.find({ gymId });
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addProduct = async (req, res) => {
  try {
    const gymId = getGymId(req);
    const { name, price, stock } = req.body;
    const newProduct = await Product.create({ gymId, name, price, stock });
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.sellProduct = async (req, res) => {
  try {
    const gymId = getGymId(req);
    const { userId, productId, quantity, paymentMethod } = req.body;

    const product = await Product.findOne({ _id: productId, gymId });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ message: "Not enough stock!" });

    // Stock update karo
    product.stock -= quantity;
    await product.save();

    const totalAmount = product.price * quantity;
    const isGuest = userId === 'GUEST';

    // Passbook me entry
    await Transaction.create({
      gymId,
      userId: isGuest ? null : userId,
      isGuest,
      type: 'CREDIT',
      amount: totalAmount,
      description: `Sold ${quantity}x ${product.name}`,
      paymentMethod: paymentMethod || 'CASH'
    });

    res.json({ message: "Sale successful" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTransactions = async (req, res) => {
  try {
    const gymId = getGymId(req);
    const transactions = await Transaction.find({ gymId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};