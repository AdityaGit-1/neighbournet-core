const User = require('../models/User');
const redisClient = require('../config/redis');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { pincode } = req.params;
    const key = `leaderboard:${pincode}`;

    // ZREVRANGE with scores: top 10, highest reputation first
    const raw = await redisClient.zrevrange(key, 0, 9, 'WITHSCORES');

    // raw comes back as a flat array: [userId1, score1, userId2, score2, ...]
    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ userId: raw[i], score: parseInt(raw[i + 1], 10) });
    }

    // Fetch user details for display
    const userIds = entries.map((e) => e.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name profilePicture badges');
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const leaderboard = entries.map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      score: e.score,
      name: userMap[e.userId]?.name || 'Unknown',
      profilePicture: userMap[e.userId]?.profilePicture || '',
      badges: userMap[e.userId]?.badges || [],
    }));

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('Get leaderboard error:', err.message);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

module.exports = { getProfile, getLeaderboard };