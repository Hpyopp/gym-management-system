const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  customerName: { type: String, required: true },      // Kis member ne kharida
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subTotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  commissionEarned: { type: Number, required: true },  // Gym ka fayda
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'UPI' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);