const express = require('express');
const router = express.Router();
const { auth, db, firebaseInitialized } = require('../config/firebase');

/**
 * Debug configuration status
 * GET /api/debug/config
 */
router.get('/config', (req, res) => {
    res.json({
        success: true,
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 4000,
        firebaseInitialized: firebaseInitialized,
        corsOrigins: process.env.CORS_ORIGINS || 'default',
        timestamp: new Date().toISOString()
    });
});

/**
 * End-to-end Firebase and Firestore test
 * GET /api/debug/firebase
 */
router.get('/firebase', async (req, res) => {
    if (!firebaseInitialized) {
        return res.status(503).json({
            success: false,
            error: "Firebase Admin SDK failed to initialize. Check your credentials and .env file."
        });
    }

    try {
        const results = {};

        // 1. Test Auth: Try to list 1 user
        try {
            const userList = await auth.listUsers(1);
            results.auth = { status: 'success', users_found: userList.users.length };
        } catch (authErr) {
            results.auth = { status: 'fail', error: authErr.message };
        }

        // 2. Test Firestore: Write a ping doc
        try {
            const testRef = db.collection('_connectivity_test').doc('ping');
            await testRef.set({
                lastPing: new Date().toISOString(),
                source: 'Linode Debug Route',
                platform: 'Node.js'
            });
            results.firestore_write = 'success';
        } catch (fsErr) {
            results.firestore_write = { status: 'fail', error: fsErr.message };
        }

        // 3. Test Firestore: Read it back
        try {
            const testRef = db.collection('_connectivity_test').doc('ping');
            const doc = await testRef.get();
            results.firestore_read = { status: 'success', data: doc.data() };
        } catch (fsErr) {
            results.firestore_read = { status: 'fail', error: fsErr.message };
        }

        const isFullyFunctional = results.auth.status === 'success' &&
            results.firestore_write === 'success' &&
            results.firestore_read.status === 'success';

        res.status(isFullyFunctional ? 200 : 207).json({
            success: isFullyFunctional,
            firebase_status: 'initialized',
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Connectivity test failed spectacularly",
            details: error.message
        });
    }
});

module.exports = router;
