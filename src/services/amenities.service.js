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
            throw new Error('Firestore not initialized');
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
}

module.exports = AmenityService;
