require('dotenv').config();
const { db, firebaseInitialized } = require('../src/config/firebase');

async function testFirebase() {
    console.log('--- Firebase Connectivity Test ---');
    console.log(`Initialized: ${firebaseInitialized}`);

    if (!firebaseInitialized || !db) {
        console.error('Γ¥î Firebase NOT initialized. Check credentials.');
        process.exit(1);
    }

    try {
        const testRef = db.collection('_sync_test').doc('connectivity');
        const timestamp = new Date().toISOString();

        console.log('Writing test document...');
        await testRef.set({
            status: 'ok',
            lastRun: timestamp,
            environment: process.env.NODE_ENV || 'development'
        });
        console.log('Γ£à Write successful.');

        console.log('Reading test document...');
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('Γ£à Read successful:', doc.data());
        } else {
            throw new Error('Document not found after write');
        }

        console.log('Cleaning up...');
        await testRef.delete();
        console.log('Γ£à Cleanup successful.');

        console.log('--- TEST PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('Γ¥î TEST FAILED:', err.message);
        process.exit(1);
    }
}

testFirebase();
