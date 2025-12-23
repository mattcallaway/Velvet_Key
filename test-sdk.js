const admin = require('firebase-admin');
require('dotenv').config();

/**
 * IDIOT-PROOF Firebase SDK Handshake Test
 * Run this directly on the server to prove the service account is valid.
 */

console.log('--- Firebase SDK Handshake Test ---');

try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error("Missing required Firebase environment variables in .env");
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            })
        });
        console.log("✅ SDK Initialized.");
    }

    const authPromise = admin.auth().listUsers(1)
        .then(() => console.log("✅ Auth Success: Can communicate with Google Firebase servers."))
        .catch(err => {
            console.error("❌ Auth Failed:", err.message);
            throw err;
        });

    const { getFirestore } = require('firebase-admin/firestore');
    const db = process.env.FIREBASE_DATABASE_ID
        ? getFirestore(admin.app(), process.env.FIREBASE_DATABASE_ID)
        : getFirestore(admin.app());

    const firestorePromise = db.collection('_connectivity_test').doc('ping').get()
        .then(() => console.log("✅ Firestore Success: Can reach database " + (process.env.FIREBASE_DATABASE_ID || "(default)")))
        .catch(err => {
            console.error("❌ Firestore Failed:", err.message);
            throw err;
        });

    Promise.all([authPromise, firestorePromise])
        .then(() => process.exit(0))
        .catch(() => process.exit(1));

} catch (err) {
    console.error("❌ Initialization Failed: Could not even start the SDK.");
    console.error("Reason:", err.message);
    process.exit(1);
}
