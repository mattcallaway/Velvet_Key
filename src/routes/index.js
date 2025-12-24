const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./users.routes');
const rentalRoutes = require('./rentals.routes');
const bookingsRoutes = require('./bookings.routes');
const activityRoutes = require('./activity.routes');
const amenitiesRoutes = require('./amenities.routes');
const debugRoutes = require('./debug');
const healthTestRoutes = require('./health');

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

// Activity Feed (Phase 3)
router.use('/host/activity', activityRoutes);

// Amenities
router.use('/amenities', amenitiesRoutes);

// Debug (Temporary for testing)
router.use('/debug', debugRoutes);

// Health (Directly under /api)
router.use('/health-check', healthTestRoutes);

// Reviews (Routes handle their own paths)
const reviewsRoutes = require('./reviews.routes');
router.use('/', reviewsRoutes);

module.exports = router;
