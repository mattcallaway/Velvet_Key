const userService = require('../services/user.service');
const { success, error: errorResponse } = require('../utils/response.util');

/**
 * Users Controller
 * 
 * HTTP request handlers for user profile management
 */

/**
 * Get user profile
 * GET /api/users/:id
 * Public route
 */
async function getUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        return success(res, { user }, 'User profile retrieved successfully');
    } catch (err) {
        if (err.statusCode === 404) {
            return errorResponse(res, err.message, 404);
        }
        return errorResponse(res, 'Failed to retrieve user profile', 500);
    }
}

/**
 * Update user profile
 * PUT /api/users/:id
 * Protected route - requires authentication and ownership
 */
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Ownership check is handled by requireOwnerOrAdmin middleware
        const updatedUser = await userService.updateUserProfile(id, updates);

        return success(res, { user: updatedUser }, 'Profile updated successfully');
    } catch (err) {
        if (err.statusCode === 404) {
            return errorResponse(res, err.message, 404);
        }
        if (err.code === 'P2002') {
            // Prisma unique constraint violation
            return errorResponse(res, 'Email or phone number already in use', 400);
        }
        return errorResponse(res, 'Failed to update profile', 500);
    }
}

/**
 * Delete user account
 * DELETE /api/users/:id
 * Protected route - requires authentication and ownership
 */
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        // Ownership check is handled by requireOwnerOrAdmin middleware
        await userService.deleteUserAccount(id);

        return success(res, null, 'Account deleted successfully');
    } catch (err) {
        if (err.statusCode === 404) {
            return errorResponse(res, err.message, 404);
        }
        if (err.code === 'P2003') {
            // Prisma foreign key constraint violation
            return errorResponse(
                res,
                'Cannot delete account with active bookings or rentals. Please cancel them first.',
                400
            );
        }
        return errorResponse(res, 'Failed to delete account', 500);
    }
}

/**
 * Get user reviews
 * GET /api/users/:id/reviews
 * Public route
 */
async function getUserReviews(req, res) {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;

        const result = await userService.getUserReviews(id, { page, limit });

        return success(res, result, 'Reviews retrieved successfully');
    } catch (err) {
        return errorResponse(res, 'Failed to retrieve reviews', 500);
    }
}

module.exports = {
    getUser,
    updateUser,
    deleteUser,
    getUserReviews,
};
