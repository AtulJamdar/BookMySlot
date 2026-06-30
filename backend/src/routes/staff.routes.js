const express = require('express');
const { body, validationResult } = require('express-validator');
const staffController = require('../controllers/staff.controller');
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
const createStaffValidator = [
  body('name').notEmpty().withMessage('Staff name is required').trim(),
  body('title').optional().trim(),
  body('serviceIds').optional().isArray().withMessage('Service IDs must be an array'),
  body('workingHours').optional().isArray().withMessage('Working hours must be an array'),
  body('workingHours.*.day').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Invalid day in working hours'),
  body('workingHours.*.start').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM format'),
  body('workingHours.*.end').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be HH:MM format')
];

const updateStaffValidator = [
  body('name').optional().notEmpty().withMessage('Staff name cannot be empty').trim(),
  body('title').optional().trim(),
  body('serviceIds').optional().isArray().withMessage('Service IDs must be an array'),
  body('workingHours').optional().isArray().withMessage('Working hours must be an array'),
  body('workingHours.*.day').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Invalid day in working hours'),
  body('workingHours.*.start').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM format'),
  body('workingHours.*.end').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be HH:MM format')
];

// Routes
router.get('/', optionalAuthenticate, staffController.listStaff);
router.post('/', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, createStaffValidator, validateRequest, staffController.createStaff);
router.put('/:id', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, updateStaffValidator, validateRequest, staffController.updateStaff);
router.delete('/:id', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, staffController.deleteStaff);

module.exports = router;
