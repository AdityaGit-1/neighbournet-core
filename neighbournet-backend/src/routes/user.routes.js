const express = require('express');
const { getProfile, getLeaderboard } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/leaderboard/:pincode', protect, getLeaderboard);

module.exports = router;