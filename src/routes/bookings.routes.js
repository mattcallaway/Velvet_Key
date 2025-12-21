const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBooking, handleValidationErrors } = require('../middleware/validation.middleware');
const { body } = require('express-validator');

// All routes require authentication
router.use(authenticate);

// Create booking
router.post(
    '/',
    validateBooking,
    bookingsController.createBooking
);

// Get my bookings (query param ?role=HOST for host view)
router.get(
    '/',
    bookingsController.getMyBookings
);

// Get specific booking
router.get(
    '/:id',
    bookingsController.getBooking
);

// Update status (Host confirms/declines, Guest cancels)
router.patch(
    '/:id/status',
    [
        body('status')
            .isIn(['CONFIRMED', 'DECLINED', 'CANCELLED'])
            .withMessage('Invalid status value'),
        handleValidationErrors
    ],
    bookingsController.updateStatus
);

module.exports = router;
