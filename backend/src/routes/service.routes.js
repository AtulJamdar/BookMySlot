const express = require('express');
const { body, validationResult } = require('express-validator');
const serviceController = require('../controllers/service.controller');
const { authenticate, requireRole, requireBusinessScope } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const router = express.Router();

// Validation result resolver
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      errors.array()[0].msg,
      400
    );
  }
  next();
};

// Optional auth resolver for GET route
const optionalAuthenticate = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, () => {
      if (req.user && req.user.role === ROLES.BUSINESS_OWNER) {
        req.businessId = req.user.businessId;
      }
      next();
    });
  }
  next();
};

// Validation rules
const createServiceValidator = [
  body('name').notEmpty().withMessage('Service name is required').trim(),
  body('durationMinutes')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes')
    .custom((val) => val % 15 === 0)
    .withMessage('Duration must be a multiple of 15 minutes'),
  body('priceINR')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
];

const updateServiceValidator = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty').trim(),
  body('durationMinutes')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes')
    .custom((val) => val % 15 === 0)
    .withMessage('Duration must be a multiple of 15 minutes'),
  body('priceINR')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
];

// Routes
router.get('/', optionalAuthenticate, serviceController.listServices);
router.post('/', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, createServiceValidator, validateRequest, serviceController.createService);
router.put('/:id', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, updateServiceValidator, validateRequest, serviceController.updateService);
router.delete('/:id', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, serviceController.deleteService);

module.exports = router;
