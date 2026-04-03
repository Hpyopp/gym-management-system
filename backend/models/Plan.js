const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ideally ref 'Gym' hona chahiye par tere hisaab se
  
  // 🔥 THE FIX: Inko required: false kar diya kyunki tera frontend nahi bhejta
  planName: { type: String, required: false, default: 'Custom Plan' }, 
  goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance'], required: false, default: 'Maintenance' },
  
  minWeight: { type: Number, required: true },
  maxWeight: { type: Number, required: true },
  
  // Diet Section (Tera frontend sirf 'dietPlan' bhejta hai ek text box se)
  dietPlan: { type: String, required: true }, // 🔥 YEH NAAM FRONTEND WALA HAI
  
  // Workout Section
  workoutPlan: { type: String, required: true } // 🔥 YEH NAAM FRONTEND WALA HAI
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);