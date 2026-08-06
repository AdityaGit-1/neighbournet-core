const express = require('express');
const { createPost, getPostById, getFeed, upvotePost, downvotePost, confirmIssue, uploadImage } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { postRateLimiter } = require('../middleware/rateLimit.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/feed', protect, getFeed);
router.post('/upload', protect, upload.single('image'), uploadImage);
router.post('/', protect, postRateLimiter, createPost);
router.get('/:id', protect, getPostById);
router.post('/:id/upvote', protect, upvotePost);
router.post('/:id/downvote', protect, downvotePost);
router.post('/:id/confirm', protect, confirmIssue);

module.exports = router;