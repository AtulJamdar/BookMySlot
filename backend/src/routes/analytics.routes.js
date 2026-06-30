const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, requireRole, requireBusinessScope } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Owner-scoped metrics
router.get('/summary', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, analyticsController.getAnalyticsSummary);
router.get('/peak-hours', authenticate, requireRole(ROLES.BUSINESS_OWNER), requireBusinessScope, analyticsController.getPeakHours);

// Super Admin-scoped metrics
router.get('/all', authenticate, requireRole(ROLES.SUPER_ADMIN), analyticsController.getSuperAdminAnalytics);

module.exports = router;
