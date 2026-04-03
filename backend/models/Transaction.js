const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  isGuest: { type: Boolean, default: false },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true }, 
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  paymentMethod: { type: String, enum: ['CASH', 'UPI', 'WALLET'], default: 'CASH' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);