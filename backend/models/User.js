const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  notifications: [{ message: String, type: { type: String }, date: { type: Date, default: Date.now } }]
}, { timestamps: true });

// PASSWORD HASHING LOGIC (Database mein save hone se pehle chalega)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);