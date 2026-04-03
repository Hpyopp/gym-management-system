const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  planDuration: { type: Number, required: true }, // in months (1, 3, 6, 12)
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);