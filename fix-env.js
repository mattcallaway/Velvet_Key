#!/usr/bin/env node

/**
 * Fix Firebase Private Key in .env file
 * 
 * This script removes the trailing backslash from FIREBASE_PRIVATE_KEY
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔧 Fixing Firebase private key format...\n');

try {
    // Read .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Fix the FIREBASE_PRIVATE_KEY line
    // Remove any trailing backslash before the newline
    envContent = envContent.replace(
        /FIREBASE_PRIVATE_KEY="([^"]+)"\\/g,
        'FIREBASE_PRIVATE_KEY="$1"'
    );

    // Also handle case where backslash is at end of line
    envContent = envContent.replace(
        /(FIREBASE_PRIVATE_KEY="[^"]+")\\$/gm,
        '$1'
    );

    // Write back to .env
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('✅ Fixed .env file');
    console.log('\nVerifying...\n');

    // Show the Firebase lines
    const lines = envContent.split('\n');
    const firebaseLines = lines.filter(line => line.includes('FIREBASE'));

    firebaseLines.forEach(line => {
        if (line.includes('PRIVATE_KEY')) {
            // Show just the beginning and end
            const start = line.substring(0, 50);
            const end = line.substring(line.length - 50);
            console.log(`${start}...${end}`);
        } else {
            console.log(line);
        }
    });

    console.log('\n✅ Done! Now run: npm run test:firebase');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
