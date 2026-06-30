const express = require('express');
const { body, validationResult } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
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

// Optional auth resolver for public guest booking creation / cancellation
const optionalAuthenticate = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
};

// Validation rules
const createBookingValidator = [
  body('businessId').notEmpty().withMessage('Business ID is required').isMongoId().withMessage('Invalid Business ID format'),
  body('serviceId').notEmpty().withMessage('Service ID is required').isMongoId().withMessage('Invalid Service ID format'),
  body('staffId').notEmpty().withMessage('Staff ID is required').isMongoId().withMessage('Invalid Staff ID format'),
  body('customerName').notEmpty().withMessage('Customer name is required').trim(),
  body('customerEmail').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('customerPhone').notEmpty().withMessage('Customer phone is required').trim(),
  body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime').notEmpty().withMessage('Start time is required').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM format'),
  body('notes').optional().trim()
];

const cancelBookingValidator = [
  body('reason').optional().trim()
];

// Routes
router.post('/', optionalAuthenticate, createBookingValidator, validateRequest, bookingController.createBooking);
router.get('/', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, bookingController.listBusinessBookings);
router.get('/my', authenticate, requireRole(ROLES.CUSTOMER), bookingController.listCustomerBookings);
router.get('/all', authenticate, requireRole(ROLES.SUPER_ADMIN), bookingController.listAllBookings);
router.get('/:id', optionalAuthenticate, bookingController.getBookingDetail);
router.patch('/:id/cancel', optionalAuthenticate, cancelBookingValidator, validateRequest, bookingController.cancelBooking);

module.exports = router;
