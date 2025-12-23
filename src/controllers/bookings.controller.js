const bookingService = require('../services/booking.service');
const { successResponse } = require('../utils/response.util');

class BookingsController {
    /**
     * Create a new booking
     */
    async createBooking(req, res, next) {
        try {
            const guestId = req.user.id; // From auth middleware
            const booking = await bookingService.createBooking(guestId, req.body);

            res.status(201).json(successResponse('Booking request created successfully', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get booking details
     */
    async getBooking(req, res, next) {
        try {
            const bookingId = req.params.id;
            const userId = req.user.id;

            const booking = await bookingService.getBookingById(bookingId, userId);

            res.json(successResponse('Booking details retrieved', booking));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's bookings (Guest or Host)
     */
    async getMyBookings(req, res, next) {
        try {
            const userId = req.user.id;
            const role = req.query.role === 'HOST' ? 'HOST' : 'GUEST';

            const bookings = await bookingService.getUserBookings(userId, role);

            res.json(successResponse('Bookings retrieved successfully', bookings));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update booking status
     */
    async updateStatus(req, res, next) {
        try {
            const bookingId = req.params.id;
            const userId = req.user.id;
            const { status } = req.body;

            const updatedBooking = await bookingService.updateBookingStatus(bookingId, userId, status);

            res.json(successResponse('Booking status updated', updatedBooking));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingsController();
