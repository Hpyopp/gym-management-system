const express = require('express');
const router = express.Router();
const { createPlan, getAdminPlans, deletePlan, getMyPlan } = require('../controllers/planController');

// 🔥 THE FIX: Frontend /api/plans maangta hai, isliye root '/' pe list deni padegi
router.get('/', getAdminPlans); 

// Admin Routes (Manage Plans)
router.post('/create', createPlan);
router.delete('/:id', deletePlan);

// Member Route (Fetch their specific plan)
router.get('/my-plan/:userId', getMyPlan);

module.exports = router;