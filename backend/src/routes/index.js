// Main API router mounting all sub-routes
const express = require('express');
const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const serviceRoutes = require('./service.routes');
const staffRoutes = require('./staff.routes');
const slotRoutes = require('./slot.routes');
const bookingRoutes = require('./booking.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/services', serviceRoutes);
router.use('/staff', staffRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
