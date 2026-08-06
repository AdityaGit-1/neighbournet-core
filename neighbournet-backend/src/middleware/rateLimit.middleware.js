const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const postRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'ratelimit:post:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 posts per hour per key
  keyGenerator: (req) => req.userId, // rate limit per authenticated user, not IP
  message: { message: 'Post limit reached — max 10 posts per hour. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { postRateLimiter };