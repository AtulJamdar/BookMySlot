const express = require('express');
const { body, validationResult } = require('express-validator');
const businessController = require('../controllers/business.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
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

// Validation rules
const updateBusinessValidator = [
  body('name').optional().notEmpty().withMessage('Business name cannot be empty').trim(),
  body('phone').optional().notEmpty().withMessage('Business phone cannot be empty').trim(),
  body('bufferMinutes').optional().isInt({ min: 0 }).withMessage('Buffer minutes must be a non-negative integer'),
  body('workingHours').optional().isArray().withMessage('Working hours must be an array'),
  body('workingHours.*.day').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Invalid day in working hours'),
  body('workingHours.*.start').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM format'),
  body('workingHours.*.end').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be HH:MM format')
];

// Routes
router.get('/:slug', businessController.getBusinessBySlug);
router.put('/:id', authenticate, requireRole(ROLES.BUSINESS_OWNER), updateBusinessValidator, validateRequest, businessController.updateBusiness);
router.get('/', authenticate, businessController.listBusinesses);
router.patch('/:id/suspend', authenticate, requireRole(ROLES.SUPER_ADMIN), businessController.suspendBusiness);

module.exports = router;
