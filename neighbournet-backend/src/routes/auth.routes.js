const express = require('express');
const passport = require('passport');
const { register, login, getMe, googleCallback } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  googleCallback
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

module.exports = router;