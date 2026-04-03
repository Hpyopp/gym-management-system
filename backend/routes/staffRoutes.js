const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.post('/add', staffController.addStaff);
router.post('/login', staffController.staffLogin);
router.get('/list', staffController.getStaffList);

module.exports = router;