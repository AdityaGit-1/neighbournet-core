const redisClient = require('../config/redis');

const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null; // fail open — treat as cache miss rather than crash
  }
};

const setCache = async (key, value, ttlSeconds) => {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Cache set error:', err.message);
    // non-fatal — the app still works without caching, just slower
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error('Cache delete error:', err.message);
  }
};

const invalidatePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error('Cache invalidate pattern error:', err.message);
  }
};

module.exports = { getCache, setCache, deleteCache, invalidatePattern };