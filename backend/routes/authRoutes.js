const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/authController');

// Open routes - koi bhi hit kar sakta hai
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;