const prisma = require('../config/database');

/**
 * User Service
 * 
 * Business logic for user profile management
 */

/**
 * Get user by ID with stats
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile with stats
 */
async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phoneNumber: true,
            bio: true,
            profileImageUrl: true,
            emailVerified: true,
            phoneVerified: true,
            identityVerified: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            // Exclude sensitive fields
            // firebaseUid: false
        },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
    }

    // Calculate user stats
    const stats = await getUserStats(userId);

    return {
        ...user,
        stats,
    };
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User stats
 */
async function getUserStats(userId) {
    const [bookingsCount, reviewsCount, averageRating] = await Promise.all([
        // Total bookings as guest
        prisma.booking.count({
            where: { guestId: userId },
        }),

        // Total reviews received
        prisma.review.count({
            where: { subjectId: userId },
        }),

        // Average rating
        prisma.review.aggregate({
            where: { subjectId: userId },
            _avg: { rating: true },
        }),
    ]);

    return {
        totalBookings: bookingsCount,
        reviewCount: reviewsCount,
        averageRating: averageRating._avg.rating || 0,
    };
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user
 */
async function updateUserProfile(userId, updates) {
    // Fields that can be updated
    const allowedUpdates = [
        'firstName',
        'lastName',
        'phoneNumber',
        'bio',
        'profileImageUrl',
    ];

    // Filter out non-allowed fields
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...filteredUpdates,
            updatedAt: new Date(),
        },
        select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phoneNumber: true,
            bio: true,
            profileImageUrl: true,
            emailVerified: true,
            phoneVerified: true,
            identityVerified: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
        },
    });

    return updatedUser;
}

/**
 * Delete user account
 * Note: This is a hard delete. Consider implementing soft delete in production.
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function deleteUserAccount(userId) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
    }

    // TODO: In production, implement soft delete or handle related records
    // For now, we'll just delete the user
    // Note: This will fail if user has related records due to foreign key constraints
    await prisma.user.delete({
        where: { id: userId },
    });
}

/**
 * Get user reviews (paginated)
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Reviews with pagination
 */
async function getUserReviews(userId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { subjectId: userId },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImageUrl: true,
                    },
                },
                rental: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.review.count({
            where: { subjectId: userId },
        }),
    ]);

    return {
        reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

module.exports = {
    getUserById,
    getUserStats,
    updateUserProfile,
    deleteUserAccount,
    getUserReviews,
};
