const express = require('express');
const router = express.Router();
const { loginUser, logoutUser, registerUser } = require('../controllers/authController');

// Open routes - koi bhi hit kar sakta hai
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// THE BUG FIX: Naya darwaza registration ke liye
router.post('/register', registerUser);

module.exports = router;