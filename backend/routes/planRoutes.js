const express = require('express');
const router = express.Router();
const { getMyPlan } = require('../controllers/planController');

router.get('/my-plan/:userId', getMyPlan);

module.exports = router;