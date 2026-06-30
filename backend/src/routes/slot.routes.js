const express = require('express');
const { body, validationResult } = require('express-validator');
const slotController = require('../controllers/slot.controller');
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

const blockSlotValidator = [
  body('staffId').notEmpty().withMessage('Staff ID is required').isMongoId().withMessage('Invalid Staff ID format'),
  body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('startTime').notEmpty().withMessage('Start time is required').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM format'),
  body('endTime').notEmpty().withMessage('End time is required').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be HH:MM format'),
  body('reason').optional().trim()
];

// Routes
router.get('/available', slotController.getAvailableSlots); // Public availability query
router.get('/', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, slotController.listBlockedSlots);
router.post('/block', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, blockSlotValidator, validateRequest, slotController.blockSlot);
router.delete('/:id/unblock', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, slotController.unblockSlot);

module.exports = router;
