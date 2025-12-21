const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const rentalRoutes = require('./rentals.routes');

/**
 * API Routes Aggregator
 * 
 * Mounts all route modules under their respective paths.
 */

// Health check
router.use('/health', healthRoutes);

// Authentication
router.use('/auth', authRoutes);

// Users
router.use('/users', userRoutes);

// Rentals
router.use('/rentals', rentalRoutes);

// TODO: Add more routes as we build them
// router.use('/bookings', bookingRoutes);

module.exports = router;
