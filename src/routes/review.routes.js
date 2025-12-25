const express = require('express');
const { body } = require('express-validator');
const reviewsController = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    [
        body('bookingId').isUUID().withMessage('Valid booking ID is required'),
        body('rentalId').isUUID().withMessage('Valid rental ID is required'),
        body('subjectId').isUUID().withMessage('Valid subject ID is required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isString().trim().isLength({ max: 1000 }),
        body('reviewType').isIn(['GUEST_TO_HOST', 'HOST_TO_GUEST']).withMessage('Invalid review type'),
    ],
    reviewsController.create
);

/**
 * @route   GET /api/reviews/rental/:rentalId
 * @desc    Get reviews for a rental
 * @access  Public
 */
router.get('/rental/:rentalId', reviewsController.getByRental);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews about a user
 * @access  Public
 */
router.get('/user/:userId', reviewsController.getByUser);

module.exports = router;
