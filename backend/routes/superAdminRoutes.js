const express = require('express');
const router = express.Router();
const { getAllGyms, toggleGymStatus, createGym, getGymInsights, updateGymPlan } = require('../controllers/superAdminController');

router.get('/gyms', getAllGyms);
router.put('/gyms/toggle/:id', toggleGymStatus);
router.post('/gyms/add', createGym);
router.get('/gyms/:id/insights', getGymInsights);

// 🔥 NEW ROUTE FOR UPGRADING PLAN 🔥
router.put('/gyms/:id/plan', updateGymPlan);

module.exports = router;