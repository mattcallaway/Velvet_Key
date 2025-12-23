const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');

// 1. Firebase Admin initialization status
router.get('/firebase-status', (req, res) => {
    try {
        const isInitialized = admin.apps.length > 0;
        res.json({
            status: isInitialized ? 'ready' : 'not_initialized',
            project_id: process.env.FIREBASE_PROJECT_ID,
            apps_count: admin.apps.length
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// 2. Firestore Read/Write Test
router.get('/firestore-test', async (req, res) => {
    try {
        if (!db) throw new Error("Firestore not initialized (check FIREBASE_DATABASE_ID)");

        const testRef = db.collection('_connectivity_test').doc('ping');

        // Write test
        await testRef.set({
            lastPing: admin.firestore.FieldValue.serverTimestamp(),
            message: "Connectivity test from Linode"
        });

        // Read test
        const doc = await testRef.get();

        res.json({
            success: true,
            operation: 'read_after_write',
            data: doc.data()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});

// 3. Auth handshake test (List 1 user)
router.get('/auth-test', async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers(1);
        res.json({
            success: true,
            message: "Can communicate with Firebase Auth",
            users_found: listUsersResult.users.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});

module.exports = router;
