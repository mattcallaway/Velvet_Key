const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/auth.middleware');
const { requireOwnerOrAdmin } = require('../middleware/role.middleware');
const {
    validateProfileUpdate,
    validateUserId,
    validatePagination,
} = require('../middleware/validation.middleware');

/**
 * User Routes
 * 
 * Public and protected routes for user profile management
 */

// Public routes
router.get('/:id', validateUserId, usersController.getUser);
router.get('/:id/reviews', validateUserId, validatePagination, usersController.getUserReviews);

// Protected routes (require authentication and ownership)
router.put(
    '/:id',
    validateUserId,
    verifyFirebaseToken,
    requireOwnerOrAdmin,
    validateProfileUpdate,
    usersController.updateUser
);

router.delete(
    '/:id',
    validateUserId,
    verifyFirebaseToken,
    requireOwnerOrAdmin,
    usersController.deleteUser
);

module.exports = router;
