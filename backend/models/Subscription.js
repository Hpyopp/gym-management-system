const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Expired', 'Free Trial'], default: 'Active' },
  paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);