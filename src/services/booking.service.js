const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../middleware/error.middleware');

/**
 * Check if a rental is available for the given dates
 * @param {string} rentalId
 * @param {Date} checkIn
 * @param {Date} checkOut
 * @returns {Promise<boolean>}
 */
async function checkAvailability(rentalId, checkIn, checkOut) {
    const overlappingBookings = await prisma.booking.findMany({
        where: {
            rentalId,
            status: {
                in: ['PENDING', 'CONFIRMED'], // Ignore Cancelled/Declined
            },
            OR: [
                {
                    // New CheckIn is within existing range
                    checkInDate: { lte: checkIn },
                    checkOutDate: { gt: checkIn },
                },
                {
                    // New CheckOut is within existing range
                    checkInDate: { lt: checkOut },
                    checkOutDate: { gte: checkOut },
                },
                {
                    // New range envelopes existing range
                    checkInDate: { gte: checkIn },
                    checkOutDate: { lte: checkOut },
                },
            ],
        },
    });

    return overlappingBookings.length === 0;
}

/**
 * Calculate pricing for a booking
 * @param {object} rental - Rental object with price details
 * @param {Date} checkIn
 * @param {Date} checkOut
 * @param {number} guests
 */
function calculatePricing(rental, checkIn, checkOut, guests) {
    const oneDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOut - checkIn) / oneDay);

    if (nights < 1) {
        throw new BadRequestError('Booking must be at least 1 night');
    }

    const pricePerNight = Number(rental.pricePerNight);
    const subtotal = pricePerNight * nights;

    // Fees
    const cleaningFee = rental.cleaningFee ? Number(rental.cleaningFee) : 0;
    const serviceFeeRate = 0.10; // 10% platform fee
    const serviceFee = subtotal * serviceFeeRate;
    const securityDeposit = rental.securityDeposit ? Number(rental.securityDeposit) : 0;

    const totalPrice = subtotal + cleaningFee + serviceFee;

    return {
        pricePerNight,
        numberOfNights: nights,
        subtotal,
        cleaningFee,
        serviceFee,
        totalPrice,
    };
}

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(guestId, data) {
        const { rentalId, checkInDate, checkOutDate, numberOfGuests, guestMessage } = data;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // 1. Get Rental
        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
        });

        if (!rental) {
            throw new NotFoundError('Rental not found');
        }

        if (!rental.isActive || !rental.isApproved) {
            throw new BadRequestError('Rental is not available for booking');
        }

        if (rental.hostId === guestId) {
            throw new BadRequestError('You cannot book your own rental');
        }

        if (numberOfGuests > rental.maxGuests) {
            throw new BadRequestError(`Maximum guests allowed is ${rental.maxGuests}`);
        }

        // 2. Check Availability
        const isAvailable = await checkAvailability(rentalId, checkIn, checkOut);
        if (!isAvailable) {
            throw new ConflictError('Rental is not available for these dates');
        }

        // 3. Calculate Pricing
        const pricing = calculatePricing(rental, checkIn, checkOut, numberOfGuests);

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                rentalId,
                guestId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                numberOfGuests,
                guestMessage,
                ...pricing,
                status: 'PENDING',
            },
            include: {
                rental: {
                    select: {
                        title: true,
                        images: true,
                        city: true,
                    }
                }
            }
        });

        return booking;
    }

    /**
     * Get booking by ID with access control
     */
    async getBookingById(bookingId, userId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                rental: {
                    select: {
                        hostId: true, // Needed for access control
                        title: true,
                        addressLine1: true,
                        city: true,
                        state: true,
                        images: true,
                    }
                },
                guest: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true,
                    }
                }
            },
        });

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Access Control: Must be Guest or Host
        if (booking.guestId !== userId && booking.rental.hostId !== userId) {
            throw new ForbiddenError('Access denied');
        }

        return booking;
    }

    /**
     * Get bookings for a user (Guest or Host view)
     */
    async getUserBookings(userId, role) {
        if (role === 'HOST') {
            // Find bookings for rentals owned by this user
            return prisma.booking.findMany({
                where: {
                    rental: {
                        hostId: userId,
                    },
                },
                include: {
                    guest: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profileImageUrl: true,
                        }
                    },
                    rental: {
                        select: {
                            title: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Find bookings made by this user (Guest)
            return prisma.booking.findMany({
                where: {
                    guestId: userId,
                },
                include: {
                    rental: {
                        select: {
                            title: true,
                            city: true,
                            images: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });
        }
    }

    /**
     * Update booking status (Host confirms/declines, Guest cancels)
     */
    async updateBookingStatus(bookingId, userId, newStatus) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                rental: { select: { hostId: true } }
            }
        });

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Logic for transitions
        // Guest can CANCEL only if PENDING or CONFIRMED (with penalty logic? simplifed for now)
        // Host can CONFIRM or DECLINE only if PENDING.

        if (booking.guestId === userId) {
            // Guest actions
            if (newStatus === 'CANCELLED') {
                if (booking.status === 'COMPLETED') {
                    throw new BadRequestError('Cannot cancel a completed booking');
                }
                // Allow cancellation
            } else {
                throw new ForbiddenError('Guests can only cancel bookings');
            }
        } else if (booking.rental.hostId === userId) {
            // Host actions
            if (booking.status !== 'PENDING' && newStatus !== 'CANCELLED') {
                // Host can only act on PENDING, or cancel an existing one
                if (booking.status === 'CONFIRMED' && newStatus === 'CANCELLED') {
                    // Host cancelling confirmed booking
                } else if (booking.status === 'PENDING') {
                    if (!['CONFIRMED', 'DECLINED'].includes(newStatus)) {
                        throw new BadRequestError('Invalid status transition for host');
                    }
                } else {
                    throw new BadRequestError(`Cannot update booking from ${booking.status} to ${newStatus}`);
                }
            }
        } else {
            throw new ForbiddenError('Access denied');
        }

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: newStatus,
                ...(newStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {})
            },
        });

        return updated;
    }
}

module.exports = new BookingService();
