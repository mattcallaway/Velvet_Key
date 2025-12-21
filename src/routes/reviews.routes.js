const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to params from parent router if needed
const reviewsController = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateReview } = require('../middleware/validation.middleware');

/**
 * @route POST /api/bookings/:bookingId/reviews
 * @desc Submit a review for a booking
 * @access Private
 */
router.post(
    '/bookings/:bookingId/reviews',
    authenticate,
    validateReview,
    reviewsController.createReview
);

/**
 * @route GET /api/rentals/:rentalId/reviews
 * @desc Get reviews for a rental
 * @access Public
 */
router.get(
    '/rentals/:rentalId/reviews',
    reviewsController.getRentalReviews
);

/**
 * @route GET /api/users/:userId/reviews
 * @desc Get reviews for a user
 * @access Public
 */
router.get(
    '/users/:userId/reviews',
    reviewsController.getUserReviews
);

module.exports = router;
