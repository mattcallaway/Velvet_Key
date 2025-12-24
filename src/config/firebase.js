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
 * 
 * Firebase is OPTIONAL - server will run without it if initialization fails.
 */

const serviceAccountPath = path.join(__dirname, '..', '..', 'firebase-service-account.json');

let firebaseInitialized = false;
let auth = null;
let storage = null;
let bucket = null;
let db = null;

try {
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
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        });
    }

    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: credential,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    // Export Firebase Admin services
    auth = admin.auth();

    // Initialize Storage gracefully
    try {
        storage = admin.storage();
        if (process.env.FIREBASE_STORAGE_BUCKET) {
            bucket = storage.bucket();
        } else {
            console.warn('⚠️  FIREBASE_STORAGE_BUCKET not provided. Storage features limited.');
        }
    } catch (storageErr) {
        console.warn('⚠️  Firebase Storage failed to initialize:', storageErr.message);
    }

    // Initialize Firestore with specific database ID if provided
    const { getFirestore } = require('firebase-admin/firestore');

    try {
        db = process.env.FIREBASE_DATABASE_ID
            ? getFirestore(admin.app(), process.env.FIREBASE_DATABASE_ID)
            : getFirestore(admin.app());
    } catch (firestoreErr) {
        console.error('⚠️  Firestore failed to initialize:', firestoreErr.message);
        throw firestoreErr; // Re-throw to fail the main init if DB is down
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('⚠️  Firebase initialization failed:', error.message);
    console.error('⚠️  Server will run without Firebase authentication');
    console.error('⚠️  Authentication endpoints will not work until Firebase is configured');

    // Firebase is optional - server can run without it
    firebaseInitialized = false;
}

module.exports = {
    admin: firebaseInitialized ? admin : null,
    auth: auth,
    storage: storage,
    bucket: bucket,
    db: db,
    firebaseInitialized,
};
