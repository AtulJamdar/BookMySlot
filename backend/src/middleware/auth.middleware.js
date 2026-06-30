const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Access token is missing or invalid',
      401
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // Contains { userId, role, businessId }
    next();
  } catch (error) {
    return errorResponse(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Session expired or invalid token',
      401
    );
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        ERROR_CODES.FORBIDDEN,
        'Forbidden: Insufficient permissions',
        403
      );
    }
    next();
  };
};

const requireBusinessScope = (req, res, next) => {
  if (!req.user || !req.user.businessId) {
    return errorResponse(
      res,
      ERROR_CODES.FORBIDDEN,
      'Forbidden: Business context scope required',
      403
    );
  }
  req.businessId = req.user.businessId;
  next();
};

module.exports = {
  authenticate,
  requireRole,
  requireBusinessScope
};
