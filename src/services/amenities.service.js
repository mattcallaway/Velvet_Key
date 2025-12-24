const { db, firebaseInitialized } = require('../config/firebase');

/**
 * AmenityService
 * 
 * Manages the global amenity catalog and handles validation for listing-level values.
 */
class AmenityService {
    static COLLECTION_NAME = 'amenity_catalog';

    /**
     * Get the full amenity catalog
     * @returns {Promise<Array>}
     */
    static async getCatalog() {
        if (!firebaseInitialized || !db) {
            console.warn('[AmenityService] Firebase not initialized, providing fallback catalog');
            return [
                { key: 'wifi', name: 'High-speed Wifi', category: 'Essentials', type: 'boolean' },
                { key: 'parking', name: 'Free Parking', category: 'Essentials', type: 'boolean' },
                { key: 'kitchen', name: 'Full Kitchen', category: 'Essentials', type: 'boolean' },
                { key: 'workspace', name: 'Dedicated Workspace', category: 'Essentials', type: 'boolean' },
                { key: 'pool', name: 'Swimming Pool', category: 'Features', type: 'boolean' },
                { key: 'gym', name: 'Fitness Center', category: 'Features', type: 'boolean' },
                { key: 'smoking', name: 'Smoking Allowed', category: 'Safety', type: 'boolean' },
                { key: 'camera', name: 'Security Cameras', category: 'Safety', type: 'boolean' }
            ];
        }

        const snapshot = await db.collection(this.COLLECTION_NAME).get();
        const catalog = [];
        snapshot.forEach(doc => {
            catalog.push(doc.data());
        });
        return catalog;
    }

    /**
     * Add or update an amenity in the global catalog
     * @param {Object} amenity 
     */
    static async upsertAmenity(amenity) {
        if (!amenity.key) throw new Error('Amenity key is required');

        const docRef = db.collection(this.COLLECTION_NAME).doc(amenity.key);
        await docRef.set({
            ...amenity,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return amenity;
    }

    /**
     * Validate a set of amenity values against the catalog
     * @param {Object} listingAmenities - Map of { key: value }
     * @returns {Promise<{isValid: boolean, errors: Array}>}
     */
    static async validateAmenities(listingAmenities) {
        const catalog = await this.getCatalog();
        const catalogMap = catalog.reduce((acc, curr) => {
            acc[curr.key] = curr;
            return acc;
        }, {});

        const errors = [];
        const validatedValues = {};

        for (const [key, value] of Object.entries(listingAmenities)) {
            const definition = catalogMap[key];

            if (!definition) {
                errors.push(`Amenity '${key}' is not defined in the global catalog.`);
                continue;
            }

            // Type Validation
            switch (definition.type) {
                case 'boolean':
                    if (typeof value !== 'boolean') errors.push(`'${key}' must be a boolean.`);
                    break;
                case 'number':
                    if (typeof value !== 'number') errors.push(`'${key}' must be a number.`);
                    break;
                case 'enum':
                    if (!definition.options.includes(value)) {
                        errors.push(`'${key}' must be one of: ${definition.options.join(', ')}.`);
                    }
                    break;
                case 'multiselect':
                    if (!Array.isArray(value) || !value.every(v => definition.options.includes(v))) {
                        errors.push(`'${key}' contains invalid options.`);
                    }
                    break;
            }

            if (errors.length === 0) {
                validatedValues[key] = value;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            values: validatedValues
        };
    }

    /**
     * Update the search index for a specific rental
     * @param {string} rentalId 
     * @param {Object} rentalData - Data from PostgreSQL (Prisma)
     */
    static async updateSearchIndex(rentalId, rentalData) {
        if (!firebaseInitialized || !db) return;

        const indexRef = db.collection('rental_search_index').doc(rentalId);

        // Flatten amenities for indexing
        // We convert boolean amenities to specific tags or searchable flags
        const filters = {
            city: rentalData.city,
            state: rentalData.state,
            price_per_night: rentalData.pricePerNight,
            max_guests: rentalData.maxGuests,
            bedrooms: rentalData.bedrooms,
            bathrooms: rentalData.bathrooms,
            property_type: rentalData.propertyType,
            amenities: rentalData.amenities || {}
        };

        const indexData = {
            rental_id: rentalId,
            filters,
            search_text: `${rentalData.title} ${rentalData.city} ${rentalData.state}`.toLowerCase(),
            updated_at: new Date().toISOString()
        };

        await indexRef.set(indexData, { merge: true });
        console.log(`[INDEX] Updated search index for rental: ${rentalId}`);
    }

    /**
     * Search listings using the Firestore index
     * @param {Object} filters 
     * @returns {Promise<Array>} List of rental IDs
     */
    static async searchInIndex(filters) {
        if (!firebaseInitialized || !db) return [];

        const {
            city,
            state,
            minPrice,
            maxPrice,
            maxGuests,
            amenities = {}
        } = filters;

        let query = db.collection('rental_search_index');

        // Coarse Filtering (Firestore)
        if (city) query = query.where('filters.city', '==', city);
        if (state) query = query.where('filters.state', '==', state);
        if (maxGuests) query = query.where('filters.max_guests', '>=', parseInt(maxGuests));

        const snapshot = await query.get();
        let results = [];
        snapshot.forEach(doc => results.push(doc.data()));

        // Fine-Grained Filtering (Backend)
        results = results.filter(item => {
            const f = item.filters;

            // Price range check
            if (minPrice && f.price_per_night < parseFloat(minPrice)) return false;
            if (maxPrice && f.price_per_night > parseFloat(maxPrice)) return false;

            // Amenity check
            for (const [key, requestedValue] of Object.entries(amenities)) {
                const actualValue = f.amenities[key];

                // If it's boolean, must be true if requested (assuming guests only filter for 'has')
                if (typeof requestedValue === 'boolean' && requestedValue && !actualValue) return false;

                // If it's numeric/enum, matching logic
                if (typeof requestedValue === 'number' && actualValue < requestedValue) return false;
                // Add more complex enum/multi-select logic here if needed
            }

            return true;
        });

        return results.map(r => r.rental_id);
    }
}

module.exports = AmenityService;
