const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  phone: { type: String },
  
  currentWeight: { type: Number },
  age: { type: Number },
  gender: { type: String },
  medicalHistory: { type: String },
  expiryDate: { type: Date },
  
  isActive: { type: Boolean, default: true },
  
  // 🔥 THE FIX: VIRTUAL WALLET ADDED
  walletBalance: { type: Number, default: 0 },
  
  notifications: [{ message: String, type: { type: String }, date: { type: Date, default: Date.now } }]
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Password hashing failed: " + error.message);
  }
});

module.exports = mongoose.model('User', userSchema);