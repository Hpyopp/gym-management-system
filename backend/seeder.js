const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // Purana data clear karega taaki duplicate na ho
    await Plan.deleteMany();

    const plans = [];
    
    // Logic: 40 se start kar, 120 tak ja, 5-5 ka gap le
    for (let w = 40; w < 120; w += 5) {
      plans.push({
        planName: `Fat Loss Plan (${w}kg - ${w + 5}kg)`,
        minWeight: w,
        maxWeight: w + 5,
        goal: 'fat_loss',
        morningDiet: `Oats + ${w * 2}ml Milk + Apple`, // Dynamic logic example
        lunchDiet: `2 Roti + Green Veggies + Salad`,
        dinnerDiet: `Soup + Boiled Veggies (Light)`,
        workoutRoutine: `Treadmill 15mins + Weight Training (Focus: ${w}kg range)`
      });
    }

    await Plan.insertMany(plans);
    console.log('Data Imported Successfully! 40-120kg Plans Added.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();