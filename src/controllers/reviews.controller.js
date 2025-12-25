const reviewService = require('../services/review.service');
const { validationResult } = require('express-validator');

class ReviewsController {
    /**
     * Create a new review
     */
    async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Validated data from request body
            const { bookingId, rentalId, subjectId, rating, comment, reviewType } = req.body;
            const authorId = req.user.id; // From auth middleware

            const review = await reviewService.create({
                bookingId,
                rentalId,
                authorId,
                subjectId,
                rating,
                comment,
                reviewType
            });

            res.status(201).json(review);
        } catch (error) {
            console.error('Create Review Error:', error);
            if (error.message.includes('already reviewed')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to create review' });
        }
    }

    /**
     * Get reviews for a rental
     */
    async getByRental(req, res) {
        try {
            const { rentalId } = req.params;
            const reviews = await reviewService.getByRental(rentalId);
            res.json(reviews);
        } catch (error) {
            console.error('Get Rental Reviews Error:', error);
            res.status(500).json({ message: 'Failed to fetch reviews' });
        }
    }

    /**
     * Get reviews about a user
     */
    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const reviews = await reviewService.getByUser(userId);
            res.json(reviews);
        } catch (error) {
            console.error('Get User Reviews Error:', error);
            res.status(500).json({ message: 'Failed to fetch reviews' });
        }
    }
}

module.exports = new ReviewsController();
