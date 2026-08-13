const User = require('../models/User');
const redisClient = require('../config/redis');

const POINTS = {
  POST_CREATED: 10,
  UPVOTE_RECEIVED: 5,
  ISSUE_RESOLVED: 20,
  DOWNVOTE_RECEIVED: -5,
  SPAM_REMOVED: -10,
};

const BADGES = [
  { name: 'Trusted Neighbour', threshold: 500 },
  { name: 'Community Leader', threshold: 2000 },
];

/**
 * Adjusts a user's reputation score, updates their Redis leaderboard entry
 * (scoped per-pincode), and checks/awards badges.
 */
const adjustReputation = async (userId, points, pincode) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.reputationScore = Math.max(0, user.reputationScore + points); // never go negative

    // Check for newly-earned badges
    for (const badge of BADGES) {
      if (user.reputationScore >= badge.threshold && !user.badges.includes(badge.name)) {
        user.badges.push(badge.name);
      }
    }

    await user.save();

    // Update Redis leaderboard for this pincode
    if (pincode) {
      try {
        await redisClient.zadd(`leaderboard:${pincode}`, user.reputationScore, userId.toString());
        await redisClient.expire(`leaderboard:${pincode}`, 60 * 60); // 1hr TTL per blueprint spec
      } catch (redisErr) {
        console.error('Leaderboard update error (non-fatal):', redisErr.message);
      }
    }

    return user;
  } catch (err) {
    console.error('Reputation adjustment error:', err.message);
    return null;
  }
};

/**
 * Awards +20 for resolving a civic issue, specifically to the ORIGINAL poster,
 * only once (checked via a "resolutionCounted" flag we don't have yet on Post —
 * for now, this fires each time status is set to "resolved").
 */
const awardResolutionBonus = async (userId, pincode) => {
  return adjustReputation(userId, POINTS.ISSUE_RESOLVED, pincode);
};

module.exports = { POINTS, BADGES, adjustReputation, awardResolutionBonus };