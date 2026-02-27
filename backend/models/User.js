const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  
  // Naye Profile Fields
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  medicalHistory: { type: String, default: 'None' },

  currentWeight: { type: Number, required: true }, 
  goal: { type: String, enum: ['fat_loss', 'muscle_gain'], default: 'fat_loss' },

  membershipType: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  
  isActive: { type: Boolean, default: true },

  notifications: [{
    message: { type: String },
    type: { type: String },
    date: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);