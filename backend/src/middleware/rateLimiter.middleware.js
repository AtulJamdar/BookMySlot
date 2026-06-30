const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'TOO_MANY_REQUESTS',
      'Too many authentication requests from this IP. Please try again after 15 minutes.',
      429
    );
  }
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'TOO_MANY_REQUESTS',
      'Too many requests. Please try again later.',
      429
    );
  }
});

module.exports = {
  authLimiter,
  globalLimiter
};
