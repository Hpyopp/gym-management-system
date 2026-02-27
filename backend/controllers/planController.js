const Plan = require('../models/Plan');
const User = require('../models/User');

const getMyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentWeight = user.currentWeight;
    const plan = await Plan.findOne({
      minWeight: { $lte: currentWeight },
      maxWeight: { $gt: currentWeight }
    });

    if (plan) {
      res.json({
        userWeight: currentWeight,
        assignedPlan: plan,
        notifications: user.notifications.reverse(),
        profile: {
          age: user.age,
          gender: user.gender,
          medicalHistory: user.medicalHistory,
          expiryDate: user.expiryDate
        }
      });
    } else {
      res.status(404).json({ message: 'No plan found for this weight range' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyPlan };