const reviewService = require('../services/review.service');
const { sendSuccess } = require('../utils/response.util');

/**
 * Create a review for a booking
 * POST /api/bookings/:bookingId/reviews
 */
exports.createReview = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const authorId = req.user.id; // From auth middleware
        const review = await reviewService.createReview(bookingId, authorId, req.body);

        sendSuccess(res, 201, 'Review submitted successfully', review);
    } catch (error) {
        next(error);
    }
};

/**
 * Get reviews for a rental
 * GET /api/rentals/:rentalId/reviews
 */
exports.getRentalReviews = async (req, res, next) => {
    try {
        const { rentalId } = req.params;
        const result = await reviewService.getReviewsByRental(rentalId);

        sendSuccess(res, 200, 'Rental reviews retrieved', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get reviews for a user
 * GET /api/users/:userId/reviews
 */
exports.getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await reviewService.getReviewsByUser(userId);

        sendSuccess(res, 200, 'User reviews retrieved', result);
    } catch (error) {
        next(error);
    }
};
