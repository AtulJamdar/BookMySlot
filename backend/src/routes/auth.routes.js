const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { BUSINESS_CATEGORIES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

const router = express.Router();

// Validation middleware resolver
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
const registerOwnerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('businessName').notEmpty().withMessage('Business name is required').trim(),
  body('category').isIn(Object.values(BUSINESS_CATEGORIES)).withMessage('Invalid business category'),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim()
];

const registerCustomerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('phone').notEmpty().withMessage('Phone number is required').trim()
];

const loginValidator = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', authLimiter, registerOwnerValidator, validateRequest, authController.registerOwner);
router.post('/register/customer', authLimiter, registerCustomerValidator, validateRequest, authController.registerCustomer);
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
