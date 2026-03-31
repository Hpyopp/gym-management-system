const mongoose = require('mongoose');

const planSchema = mongoose.Schema({
  planName: { type: String, required: true }, // e.g., "Weight Loss 40-45kg"
  minWeight: { type: Number, required: true }, // 40
  maxWeight: { type: Number, required: true }, // 45
  goal: { type: String, enum: ['fat_loss', 'muscle_gain'], default: 'fat_loss' },
  
  // Hum text store kar rahe hain, baad me image URL bhi daal sakte hain
  morningDiet: { type: String, required: true },
  lunchDiet: { type: String, required: true },
  dinnerDiet: { type: String, required: true },
  workoutRoutine: { type: String, required: true } // e.g., "Cardio + Pushups"
});

module.exports = mongoose.model('Plan', planSchema);