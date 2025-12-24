const express = require('express');
const router = express.Router();
const AmenityService = require('../services/amenities.service');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Amenity Routes
 * 
 * Provides access to the global amenity catalog and management tools.
 */

/**
 * GET /api/amenities/catalog
 * Fetch the global amenity catalog for UI rendering
 */
router.get('/catalog', async (req, res) => {
    try {
        const catalog = await AmenityService.getCatalog();
        res.json(successResponse('Amenity catalog retrieved', { catalog }));
    } catch (error) {
        console.error('Catalog Error:', error);
        res.status(500).json(errorResponse('Failed to retrieve catalog', 500));
    }
});

/**
 * POST /api/amenities/reindex (Admin only)
 * Trigger a full re-index of all rentals into the search index
 */
router.post('/reindex', async (req, res) => {
    // In a real app, check for ADMIN role here
    try {
        const rentals = await prisma.rental.findMany({
            where: { isApproved: true, isActive: true }
        });

        console.log(`Starting re-index of ${rentals.length} rentals...`);

        let successCount = 0;
        for (const rental of rentals) {
            try {
                await AmenityService.updateSearchIndex(rental.id, rental);
                successCount++;
            } catch (err) {
                console.error(`Failed to index rental ${rental.id}:`, err.message);
            }
        }

        res.json(successResponse('Re-indexing complete', {
            total: rentals.length,
            indexed: successCount
        }));
    } catch (error) {
        console.error('Re-index Error:', error);
        res.status(500).json(errorResponse('Re-indexing failed', 500));
    }
});

module.exports = router;
