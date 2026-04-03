const express = require('express');
const router = express.Router();
const { getAdminStats, getAdminMembers, addMember, updateMember, deleteMember, updateWallet } = require('../controllers/adminController');

router.get('/members', getAdminStats);
router.get('/members/list', getAdminMembers);
router.post('/members/add', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// 🔥 THE FIX: Wallet Route
router.put('/members/:id/wallet', updateWallet);

module.exports = router;