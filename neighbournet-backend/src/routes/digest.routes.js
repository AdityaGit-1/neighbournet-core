const express = require('express');
const { getDigest, triggerDigestJob } = require('../controllers/digest.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/trigger', protect, triggerDigestJob);
router.get('/:pincode', protect, getDigest);

module.exports = router;