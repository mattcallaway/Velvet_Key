const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin for server-side authentication
 * and Firebase Storage access.
 * 
 * Supports two configuration methods:
 * 1. JSON file: firebase-service-account.json (recommended)
 * 2. Environment variables (fallback)
 */

const serviceAccountPath = path.join(__dirname, '..', '..', 'firebase-service-account.json');

let credential;

// Try to use JSON file first (more reliable)
if (fs.existsSync(serviceAccountPath)) {
    console.log('✅ Using Firebase service account JSON file');
    const serviceAccount = require(serviceAccountPath);
    credential = admin.credential.cert(serviceAccount);
} else {
    // Fallback to environment variables
    console.log('⚠️  Using Firebase credentials from environment variables');
    credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
}

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Export Firebase Admin services
const auth = admin.auth();
const storage = admin.storage();
const bucket = storage.bucket();

module.exports = {
    admin,
    auth,
    storage,
    bucket,
};
