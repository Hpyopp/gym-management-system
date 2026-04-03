const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  gymCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  ownerName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  // 🔥 YEH NAYA COLUMN HAI JO MISSING THA 🔥
  plan: { 
    type: String, 
    enum: ['Starter', 'Pro', 'Elite'], 
    default: 'Starter' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);