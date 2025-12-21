const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

/**
 * API Routes Aggregator
 * 
 * Mounts all route modules under their respective paths.
 */

// Health check
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// TODO: Add more routes as we build them
// router.use('/users', userRoutes);
// router.use('/rentals', rentalRoutes);
// router.use('/bookings', bookingRoutes);

module.exports = router;
