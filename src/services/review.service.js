const prisma = require('../config/database');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../utils/customErrors');

/**
 * Review Service
 * Handles review creation, retrieval and aggregation
 */

/**
 * Create a new review
 * @param {string} bookingId - ID of the completed booking
 * @param {string} authorId - ID of the user writing the review
 * @param {Object} data - Review data { rating, comment }
 * @returns {Promise<Object>} Created review
 */
async function createReview(bookingId, authorId, data) {
    const { rating, comment } = data;

    // 1. Verify Booking Exists and Status
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { rental: true }
    });

    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    // 2. Validate Booking Status (Must be COMPLETED or CONFIRMED + Past Checkout)
    const isCompleted = booking.status === 'COMPLETED';
    const isPastCheckout = booking.status === 'CONFIRMED' && new Date() > new Date(booking.checkOutDate);

    if (!isCompleted && !isPastCheckout) {
        throw new BadRequestError('Cannot review a booking that is not completed');
    }

    // 3. Determine Role (Guest or Host) and Review Type
    let reviewType;
    let subjectId;

    if (authorId === booking.guestId) {
        // Guest reviewing Host (and propery)
        reviewType = 'GUEST_TO_HOST';
        subjectId = booking.rental.hostId;
    } else if (authorId === booking.rental.hostId) {
        // Host reviewing Guest
        reviewType = 'HOST_TO_GUEST';
        subjectId = booking.guestId;
    } else {
        throw new ForbiddenError('You are not a participant in this booking');
    }

    // 4. Check for duplicate review by this author for this booking
    // This is explicitly blocked by DB constraint @@unique([bookingId, authorId]),
    // but good to check for clearer error message.
    const existingReview = await prisma.review.findUnique({
        where: {
            bookingId_authorId: {
                bookingId,
                authorId
            }
        }
    });

    if (existingReview) {
        throw new ConflictError('You have already reviewed this booking');
    }

    // 5. Create Review
    const review = await prisma.review.create({
        data: {
            bookingId,
            rentalId: booking.rentalId,
            authorId,
            subjectId,
            reviewType,
            rating,
            comment
        }
    });

    // 6. (Optional) Auto-update status to COMPLETED if not already
    if (booking.status !== 'COMPLETED') {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'COMPLETED' }
        });
    }

    return review;
}

/**
 * Get reviews for a rental (Public)
 * @param {string} rentalId 
 * @returns {Promise<Object>} Reviews and stats
 */
async function getReviewsByRental(rentalId) {
    // Only Guest -> Host reviews are relevant for Rental display
    const reviews = await prisma.review.findMany({
        where: {
            rentalId,
            reviewType: 'GUEST_TO_HOST'
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    profileImageUrl: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate Average
    const aggregate = await prisma.review.aggregate({
        where: {
            rentalId,
            reviewType: 'GUEST_TO_HOST'
        },
        _avg: {
            rating: true
        },
        _count: true
    });

    return {
        reviews,
        stats: {
            count: aggregate._count,
            averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0
        }
    };
}

/**
 * Get reviews for a user (Public Profile)
 * @param {string} userId 
 * @returns {Promise<Object>} Reviews received by this user
 */
async function getReviewsByUser(userId) {
    const reviews = await prisma.review.findMany({
        where: {
            subjectId: userId
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    profileImageUrl: true
                }
            },
            rental: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const aggregate = await prisma.review.aggregate({
        where: {
            subjectId: userId,
        },
        _avg: {
            rating: true
        },
        _count: true
    });

    return {
        reviews,
        stats: {
            count: aggregate._count,
            averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0
        }
    };
}

module.exports = {
    createReview,
    getReviewsByRental,
    getReviewsByUser
};
