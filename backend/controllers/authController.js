const User = require('../models/User');

const registerUser = async (req, res) => {
  try {
    const { name, phone, password, weight, duration, age, gender, medicalHistory } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let end = new Date();
    if (duration === '1_month') end.setMonth(end.getMonth() + 1);
    else if (duration === '3_months') end.setMonth(end.getMonth() + 3);
    else if (duration === '6_months') end.setMonth(end.getMonth() + 6);
    else if (duration === '1_year') end.setFullYear(end.getFullYear() + 1);

    const user = await User.create({
      name,
      phone,
      password,
      currentWeight: weight,
      membershipType: duration,
      startDate: new Date(),
      expiryDate: end,
      role: 'member',
      age,
      gender,
      medicalHistory: medicalHistory || 'None'
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      role: user.role,
      message: "Registration Successful"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (user && user.password === password) {
      res.json({
        _id: user.id,
        name: user.name,
        role: user.role, 
      });
    } else {
      res.status(401).json({ message: 'Invalid Phone or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };