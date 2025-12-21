const admin = require('firebase-admin');

/**
 * Firebase Connection Test Script
 * 
 * Tests Firebase Admin SDK initialization and authentication.
 * Run this after configuring Firebase credentials.
 */

require('dotenv').config();

async function testFirebaseConnection() {
    console.log('🔥 Testing Firebase Connection...\n');

    try {
        // Check if credentials are set
        console.log('1. Checking environment variables...');
        const requiredVars = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_STORAGE_BUCKET'
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);

        if (missing.length > 0) {
            console.error('❌ Missing environment variables:', missing.join(', '));
            process.exit(1);
        }

        console.log('✅ All environment variables present\n');

        // Initialize Firebase Admin
        console.log('2. Initializing Firebase Admin SDK...');
        let credential;
        const fs = require('fs');
        const path = require('path');
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

        if (fs.existsSync(serviceAccountPath)) {
            console.log('✅ Found firebase-service-account.json');
            credential = admin.credential.cert(require(serviceAccountPath));
        } else {
            console.log('⚠️  JSON file not found, falling back to environment variables');
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            });
        }

        admin.initializeApp({
            credential,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });

        console.log('✅ Firebase Admin SDK initialized\n');

        // Test Authentication
        console.log('3. Testing Firebase Authentication...');
        const auth = admin.auth();

        // List users (this will fail if credentials are wrong)
        const listUsersResult = await auth.listUsers(1);
        console.log(`✅ Firebase Authentication working (${listUsersResult.users.length} users found)\n`);

        // Test Storage
        console.log('4. Testing Firebase Storage...');
        const bucket = admin.storage().bucket();
        const [exists] = await bucket.exists();

        if (exists) {
            console.log('✅ Firebase Storage bucket accessible\n');
        } else {
            console.log('⚠️  Storage bucket not found, but connection works\n');
        }

        console.log('🎉 All Firebase tests passed!');
        console.log('\nFirebase is properly configured and ready to use.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Firebase connection test failed:');
        console.error('Error:', error.message);

        if (error.code) {
            console.error('Error code:', error.code);
        }

        console.error('\nTroubleshooting tips:');
        console.error('- Verify your service account key is correct');
        console.error('- Check that the private key is properly escaped');
        console.error('- Ensure the service account has the necessary permissions');
        console.error('- Verify the project ID matches your Firebase project');

        process.exit(1);
    }
}

testFirebaseConnection();
