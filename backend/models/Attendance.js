const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Gym Owner ki ID
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Member ki ID
  status: { type: String, enum: ['Present'], default: 'Present' }
}, { timestamps: true }); // timestamps se aone aap date aur time save ho jayega

module.exports = mongoose.model('Attendance', attendanceSchema);