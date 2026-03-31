const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  gymName: { type: String, required: true },
  gymCode: { type: String, required: true, unique: true },
  walletBalance: { type: Number, default: 0 }, // THE GAME CHANGER: Prepaid Wallet
  totalSales: { type: Number, default: 0 } // Leaderboard ke liye
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);