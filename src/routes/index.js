const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const rentalRoutes = require('./rentals.routes');
const bookingsRoutes = require('./bookings.routes');

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

// Bookings
router.use('/bookings', bookingsRoutes);

module.exports = router;
