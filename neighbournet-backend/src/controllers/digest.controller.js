const Post = require('../models/Post');
const { generateLocalityDigest } = require('../services/ai.service');
const { getCache, setCache } = require('../services/cache.service');
const { runDailyDigestJob } = require('../services/cron.service');

const getDigest = async (req, res) => {
  try {
    const { pincode } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `digest:${pincode}:${today}`;

    // 1. Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ digest: cached, fromCache: true });
    }

    // 2. Cache miss — generate fresh
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const posts = await Post.find({ pincode, createdAt: { $gte: since } }).sort({ createdAt: -1 });

    if (posts.length === 0) {
      const emptyDigest = {
        summary: `No new activity in this area in the last 24 hours.`,
        topIssues: [],
        topRecommendations: [],
        resolvedCount: 0,
        trendingTopics: [],
        locality: null,
        generatedAt: new Date(),
      };
      return res.status(200).json({ digest: emptyDigest, fromCache: false });
    }

    const locality = posts[0].locality;
    const digestData = await generateLocalityDigest(locality, posts);
    const digest = { ...digestData, locality, generatedAt: new Date() };

    // 3. Cache for 6 hours
    await setCache(cacheKey, digest, 6 * 60 * 60);

    res.status(200).json({ digest, fromCache: false });
  } catch (err) {
    console.error('Get digest error:', err.message);
    res.status(500).json({ message: 'Server error generating digest' });
  }
};

const triggerDigestJob = async (req, res) => {
  try {
    await runDailyDigestJob();
    res.status(200).json({ message: 'Digest job triggered successfully' });
  } catch (err) {
    console.error('Manual digest trigger error:', err.message);
    res.status(500).json({ message: 'Failed to trigger digest job' });
  }
};

module.exports = { getDigest, triggerDigestJob };