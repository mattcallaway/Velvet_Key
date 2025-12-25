const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewService {
    /**
     * Create a new review
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async create(data) {
        const { bookingId, rentalId, authorId, subjectId, rating, comment, reviewType } = data;

        // 1. Verify booking exists and involves these parties
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { rental: true }
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        // 2. Check for existing review (prevent duplicates)
        const existingReview = await prisma.review.findUnique({
            where: {
                bookingId_authorId: {
                    bookingId,
                    authorId
                }
            }
        });

        if (existingReview) {
            throw new Error('You have already reviewed this booking');
        }

        // 3. Create the review
        const review = await prisma.review.create({
            data: {
                bookingId,
                rentalId,
                authorId,
                subjectId,
                rating,
                comment,
                reviewType
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        return review;
    }

    /**
     * Get reviews for a specific rental
     * @param {string} rentalId
     * @returns {Promise<Array>}
     */
    async getByRental(rentalId) {
        return prisma.review.findMany({
            where: {
                rentalId,
                reviewType: 'GUEST_TO_HOST' // Only show reviews OF the rental
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get reviews for a specific user (host or guest)
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getByUser(userId) {
        return prisma.review.findMany({
            where: {
                subjectId: userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

module.exports = new ReviewService();
