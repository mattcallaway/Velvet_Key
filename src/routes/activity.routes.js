const express = require('express');
const router = express.Router();
const { db, firebaseInitialized } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Activity Feed Routes (Phase 3)
 * 
 * Provides endpoints for Hosts to view their activity history.
 */

/**
 * GET /api/host/activity
 * Fetch activity feed for the authenticated host
 */
router.get('/', async (req, res, next) => {
    try {
        if (!firebaseInitialized || !db) {
            throw new Error('Firestore not initialized');
        }

        const hostId = req.user.id || req.user.firebaseUid;
        const { limit = 20, entityType } = req.query;

        let query = db.collection('audit_events')
            .where('host_id', '==', hostId)
            .orderBy('timestamp', 'desc')
            .limit(parseInt(limit));

        if (entityType) {
            query = query.where('entity_type', '==', entityType);
        }

        const snapshot = await query.get();
        const events = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            // Convert Firestore timestamp to ISO string for JSON
            if (data.timestamp && data.timestamp.toDate) {
                data.timestamp = data.timestamp.toDate().toISOString();
            }
            events.push(data);
        });

        res.json(successResponse('Activity feed retrieved successfully', {
            events,
            count: events.length
        }));
    } catch (error) {
        console.error('Activity Feed Error:', error);
        res.status(500).json(errorResponse('Failed to retrieve activity feed', 500));
    }
});

module.exports = router;
