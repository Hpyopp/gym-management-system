const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'staff' } // Yeh tag usko admin se alag karega
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);