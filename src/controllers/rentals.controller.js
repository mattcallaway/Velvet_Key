const rentalService = require('../services/rental.service');
const AuditService = require('../services/audit.service');
const { success, error: errorResponse } = require('../utils/response.util');

/**
 * Rentals Controller
 * 
 * HTTP request handlers for rental management
 */

/**
 * Create a new rental
 * POST /api/rentals
 */
async function createRental(req, res) {
    try {
        const hostId = req.user.id; // From auth middleware (database user id)
        const rentalData = req.body;

        const rental = await rentalService.createRental(hostId, rentalData);

        // Audit Log
        await AuditService.log({
            req,
            action: 'listing.create',
            entityType: 'listing',
            entityId: rental.id,
            metadata: { title: rental.title }
        });

        return success(res, { rental }, 'Rental created successfully. Pending approval.', 201);
    } catch (err) {
        return errorResponse(res, err.message || 'Failed to create rental', err.statusCode || 500);
    }
}

/**
 * Get rental details
 * GET /api/rentals/:id
 */
async function getRental(req, res) {
    try {
        const { id } = req.params;
        const rental = await rentalService.getRentalById(id);

        return success(res, { rental }, 'Rental retrieved successfully');
    } catch (err) {
        return errorResponse(res, err.message, err.statusCode || 500);
    }
}

/**
 * Update rental
 * PUT /api/rentals/:id
 */
async function updateRental(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Fetch current for diffing in audit log
        const before = await rentalService.getRentalById(id);
        const rental = await rentalService.updateRental(id, updates);

        // Audit Log
        await AuditService.log({
            req,
            action: 'listing.update',
            entityType: 'listing',
            entityId: id,
            metadata: {
                before: { price: before.pricePerNight, status: before.status },
                after: { price: rental.pricePerNight, status: rental.status }
            }
        });

        return success(res, { rental }, 'Rental updated successfully');
    } catch (err) {
        return errorResponse(res, err.message, err.statusCode || 500);
    }
}

/**
 * Delete rental
 * DELETE /api/rentals/:id
 */
async function deleteRental(req, res) {
    try {
        const { id } = req.params;

        await rentalService.deleteRental(id);

        // Audit Log
        await AuditService.log({
            req,
            action: 'listing.delete',
            entityType: 'listing',
            entityId: id
        });

        return success(res, null, 'Rental deleted successfully');
    } catch (err) {
        return errorResponse(res, err.message, err.statusCode || 500);
    }
}

/**
 * Search rentals
 * GET /api/rentals
 */
async function searchRentals(req, res) {
    try {
        const filters = req.query;

        const result = await rentalService.searchRentals(filters);

        return success(res, result, 'Rentals retrieved successfully');
    } catch (err) {
        return errorResponse(res, 'Failed to search rentals', 500);
    }
}

/**
 * Get host's rentals
 * GET /api/rentals/host/:hostId
 */
async function getHostRentals(req, res) {
    try {
        const { hostId } = req.params;

        // Optional: Check if requestor is the host or admin to see non-approved rentals?
        // For now, let's assume this returns all for the host
        const rentals = await rentalService.getRentalsByHost(hostId);

        return success(res, { rentals }, 'Host rentals retrieved successfully');
    } catch (err) {
        return errorResponse(res, 'Failed to retrieve host rentals', 500);
    }
}

/**
 * Approve rental (Admin)
 * POST /api/rentals/:id/approve
 */
async function approveRental(req, res) {
    try {
        const { id } = req.params;

        const rental = await rentalService.approveRental(id);

        return success(res, { rental }, 'Rental approved successfully');
    } catch (err) {
        return errorResponse(res, err.message, err.statusCode || 500);
    }
}

/**
 * Upload rental images
 * POST /api/rentals/:id/images
 */
async function uploadImages(req, res) {
    try {
        const { id } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return errorResponse(res, 'No images uploaded', 400);
        }

        const { uploadMultipleImages } = require('../utils/firebase.util');
        const imageUrls = await uploadMultipleImages(files, `rentals/${id}`);

        // Update rental with new images
        // Note: This appends to existing images or replaces? 
        // Let's assume append for now, but we need to fetch existing first
        const rental = await rentalService.getRentalById(id);
        const existingImages = rental.images || [];
        const updatedImages = [...existingImages, ...imageUrls];

        await rentalService.updateRental(id, { images: updatedImages });

        return success(res, { images: updatedImages }, 'Images uploaded successfully');
    } catch (err) {
        return errorResponse(res, err.message || 'Failed to upload images', 500);
    }
}

module.exports = {
    createRental,
    getRental,
    updateRental,
    deleteRental,
    searchRentals,
    getHostRentals,
    approveRental,
    uploadImages,
};
