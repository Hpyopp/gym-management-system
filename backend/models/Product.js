const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mrp: { type: Number, required: true }, // Customer kya dega (e.g., 3000)
  gymPrice: { type: Number, required: true }, // Gym owner ke wallet se kya katega (e.g., 2700)
  image: { type: String, default: "https://via.placeholder.com/150" },
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);