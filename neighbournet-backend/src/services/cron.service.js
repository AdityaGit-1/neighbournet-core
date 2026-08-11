const cron = require('node-cron');
const Post = require('../models/Post');
const { generateLocalityDigest } = require('./ai.service');
const { setCache } = require('./cache.service');

/**
 * Finds all distinct pincodes with activity in the last 24h,
 * generates a digest for each, and pre-warms the Redis cache
 * so users get an instant cache hit instead of waiting on generation.
 */
const runDailyDigestJob = async () => {
  console.log('[cron] Starting daily digest generation...');

  try {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const activePincodes = await Post.distinct('pincode', { createdAt: { $gte: since } });

    if (activePincodes.length === 0) {
      console.log('[cron] No active localities in the last 24h — nothing to digest.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    for (const pincode of activePincodes) {
      try {
        const posts = await Post.find({ pincode, createdAt: { $gte: since } }).sort({ createdAt: -1 });
        const locality = posts[0]?.locality || pincode;

        const digestData = await generateLocalityDigest(locality, posts);
        const digest = { ...digestData, locality, generatedAt: new Date() };

        const cacheKey = `digest:${pincode}:${today}`;
        await setCache(cacheKey, digest, 6 * 60 * 60);

        console.log(`[cron] Digest cached for pincode ${pincode} (${posts.length} posts)`);
      } catch (err) {
        // one locality's failure shouldn't stop the others
        console.error(`[cron] Failed to generate digest for pincode ${pincode}:`, err.message);
      }
    }

    console.log(`[cron] Daily digest generation complete for ${activePincodes.length} localities.`);
  } catch (err) {
    console.error('[cron] Daily digest job failed:', err.message);
  }
};

const startCronJobs = () => {
  // Runs every day at 8:00 AM server time
  cron.schedule('0 8 * * *', runDailyDigestJob);
  console.log('[cron] Daily digest job scheduled for 8:00 AM');
};

module.exports = { startCronJobs, runDailyDigestJob };