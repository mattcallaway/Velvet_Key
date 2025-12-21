const express = require('express');
const router = express.Router();
const rentalsController = require('../controllers/rentals.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { requireRole, requireOwnerOrAdmin } = require('../middleware/role.middleware');
const {
    validateRentalCreate,
    validateRentalUpdate,
    validatePagination
} = require('../middleware/validation.middleware');
const upload = require('../config/upload');

/**
 * Rental Routes
 * 
 * Public and protected routes for rental listings
 */

// Public routes
router.get('/', validatePagination, rentalsController.searchRentals);
router.get('/:id', rentalsController.getRental);
router.get('/host/:hostId', rentalsController.getHostRentals);

// Protected routes (HOST role required)
router.post(
    '/',
    verifyFirebaseToken,
    requireRole(['HOST']),
    validateRentalCreate,
    rentalsController.createRental
);

// Protected routes (Owner or Admin)
router.put(
    '/:id',
    verifyFirebaseToken,
    requireOwnerOrAdmin,
    validateRentalUpdate,
    rentalsController.updateRental
);

router.delete(
    '/:id',
    verifyFirebaseToken,
    requireOwnerOrAdmin,
    rentalsController.deleteRental
);

// Upload images
router.post(
    '/:id/images',
    verifyFirebaseToken,
    requireOwnerOrAdmin,
    upload.array('images', 10),
    rentalsController.uploadImages
);

// Admin only
router.post(
    '/:id/approve',
    verifyFirebaseToken,
    requireRole(['ADMIN']),
    rentalsController.approveRental
);

module.exports = router;
