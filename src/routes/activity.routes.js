const express = require('express');
const router = express.Router();
const { db, firebaseInitialized } = require('../config/firebase');
const { success, error } = require('../utils/response.util');

const { verifyFirebaseToken } = require('../middleware/auth.middleware');

/**
 * Activity Feed Routes (Phase 3)
 * 
 * Provides endpoints for Hosts to view their activity history.
 */

// Protect all routes
router.use(verifyFirebaseToken);

/**
 * GET /api/host/activity
 * Fetch activity feed for the authenticated host
 */
router.get('/', async (req, res, next) => {
    try {
        if (!firebaseInitialized || !db) {
            console.warn('[Activity] Firestore not initialized, returning empty feed');
            return success(res, { events: [], count: 0 }, 'Activity feed (fallback)');
        }

        const user = req.user || req.firebaseUser;
        if (!user) {
            return error(res, 'User identity not found', 401);
        }

        const hostId = user.id || user.uid;
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

        return success(res, {
            events,
            count: events.length
        }, 'Activity feed retrieved successfully');
    } catch (err) {
        console.error('Activity Feed Error:', err);
        return error(res, 'Failed to retrieve activity feed', 500);
    }
});

module.exports = router;
