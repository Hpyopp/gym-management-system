const Plan = require('../models/Plan');

const User = require('../models/User');

const jwt = require('jsonwebtoken');



// Helper function to get Gym ID

const getGymIdFromToken = (req) => {

  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) throw new Error('Unauthorized');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded.gymId;

};



// ==========================================

// ADMIN: PLAN MANAGEMENT

// ==========================================



// 1. Create New Plan

const createPlan = async (req, res) => {

  try {

    const adminGymId = getGymIdFromToken(req);

    const planData = { ...req.body, gymId: adminGymId };

   

    const newPlan = await Plan.create(planData);

    res.status(201).json({ success: true, message: "Plan Created!", plan: newPlan });

  } catch (error) {

    console.error("Create Plan Error:", error);

    res.status(500).json({ message: "Failed to create plan" });

  }

};



// 2. Get All Plans for Admin's Gym

const getAdminPlans = async (req, res) => {

  try {

    const adminGymId = getGymIdFromToken(req);

    const plans = await Plan.find({ gymId: adminGymId }).sort({ createdAt: -1 });

    res.status(200).json(plans);

  } catch (error) {

    res.status(500).json({ message: "Failed to fetch plans" });

  }

};



// 3. Delete Plan

const deletePlan = async (req, res) => {

  try {

    const adminGymId = getGymIdFromToken(req);

    const { id } = req.params;

   

    const deletedPlan = await Plan.findOneAndDelete({ _id: id, gymId: adminGymId });

    if (!deletedPlan) return res.status(404).json({ message: "Plan not found" });



    res.status(200).json({ success: true, message: "Plan deleted successfully!" });

  } catch (error) {

    res.status(500).json({ message: "Failed to delete plan" });

  }

};



// ==========================================

// MEMBER: GET ASSIGNED PLAN

// ==========================================



// 4. Auto-assign plan based on user's weight and gym

const getMyPlan = async (req, res) => {

  try {

    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });



    const currentWeight = user.currentWeight;

   

    // Find a plan in THIS gym that matches the user's weight range

    const plan = await Plan.findOne({

      gymId: user.gymId,

      minWeight: { $lte: currentWeight },

      maxWeight: { $gte: currentWeight } // Updated from $gt to $gte for exact matches

    });



    if (plan) {

      res.status(200).json({

        userWeight: currentWeight,

        assignedPlan: plan,

        notifications: user.notifications ? user.notifications.reverse() : [],

        profile: {

          age: user.age,

          gender: user.gender,

          medicalHistory: user.medicalHistory,

          expiryDate: user.expiryDate

        }

      });

    } else {

      // 404 is valid here, frontend should say "Contact Admin for a Plan"

      res.status(404).json({ message: 'No plan assigned yet for your weight profile.' });

    }

  } catch (error) {

    console.error("Get My Plan Error:", error);

    res.status(500).json({ message: "Server error while fetching plan" });

  }

};



module.exports = { createPlan, getAdminPlans, deletePlan, getMyPlan };