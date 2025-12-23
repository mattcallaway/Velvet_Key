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

    admin.auth().listUsers(1)
        .then(() => {
            console.log("✅ Auth Success: Can communicate with Google Firebase servers.");
            process.exit(0);
        })
        .catch(err => {
            console.error("❌ Auth Failed: SDK is initialized but Google rejected credentials.");
            console.error("Reason:", err.message);
            process.exit(1);
        });

} catch (err) {
    console.error("❌ Initialization Failed: Could not even start the SDK.");
    console.error("Reason:", err.message);
    process.exit(1);
}
