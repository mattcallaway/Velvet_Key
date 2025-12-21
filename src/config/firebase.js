const admin = require('firebase-admin');

/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin for server-side authentication
 * and Firebase Storage access.
 */

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
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
