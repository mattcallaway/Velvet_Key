require('dotenv').config();
const AmenityService = require('../src/services/amenities.service');
const { firebaseInitialized } = require('../src/config/firebase');

/**
 * Seed Amenity Catalog
 * 
 * Populates Firestore with an initial set of amenities for the Velvet Key marketplace.
 */
const initialAmenities = [
    // Comfort & Basics
    {
        key: 'wifi',
        label: 'High-Speed WiFi',
        type: 'boolean',
        category: 'Comfort',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },
    {
        key: 'bed_count',
        label: 'Number of Beds',
        type: 'number',
        category: 'Basics',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },
    {
        key: 'parking',
        label: 'Parking Type',
        type: 'enum',
        options: ['None', 'Street', 'Private Driveway', 'Garage', 'Valet'],
        category: 'Basics',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },

    // Luxury & Adult Features
    {
        key: 'jacuzzi',
        label: 'Jacuzzi / Hot Tub',
        type: 'boolean',
        category: 'Luxury',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },
    {
        key: 'pool_type',
        label: 'Pool Type',
        type: 'enum',
        options: ['None', 'Indoor', 'Outdoor', 'Infinity'],
        category: 'Luxury',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },
    {
        key: 'dungeon_equipped',
        label: 'Equipped Dungeon',
        type: 'boolean',
        category: 'Lifestyle',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },

    // Safety & Policies
    {
        key: 'minimum_age',
        label: 'Minimum Guest Age',
        type: 'number',
        category: 'Policies',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    },
    {
        key: 'smoking_allowed',
        label: 'Smoking Allowed',
        type: 'boolean',
        category: 'Policies',
        isSearchable: true,
        isHostCustomizable: true,
        version: 1
    }
];

async function seed() {
    console.log('--- Starting Amenity Seeding ---');

    // Wait for Firebase to initialize if it's async in your setup
    // In this project, firebase.js initializes on require but we check the flag
    if (!firebaseInitialized) {
        console.error('Firebase not initialized. Retrying in 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));
    }

    let successCount = 0;
    for (const amenity of initialAmenities) {
        try {
            await AmenityService.upsertAmenity(amenity);
            console.log(`✅ Seeded: ${amenity.label} (${amenity.key})`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed: ${amenity.key} - ${error.message}`);
        }
    }

    console.log(`--- Seeding Complete: ${successCount}/${initialAmenities.length} items ---`);
    process.exit(0);
}

seed();
