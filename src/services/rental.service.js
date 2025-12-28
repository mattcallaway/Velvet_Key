const prisma = require('../config/database');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const AmenityService = require('./amenities.service');

/**
 * Create a new rental listing
 * @param {string} hostId - ID of the host creating the rental
 * @param {Object} data - Rental data
 * @returns {Promise<Object>} Created rental
 */
async function createRental(hostId, data) {
    // Validate amenities if present
    if (data.amenities) {
        const { isValid, errors, values } = await AmenityService.validateAmenities(data.amenities);
        if (!isValid) {
            throw new BadRequestError(`Invalid amenities: ${errors.join(' ')}`);
        }
        data.amenities = values;
    }

    // Ensure maxGuests, bedrooms, bathrooms, pricePerNight are numbers
    const formattedData = {
        ...data,
        maxGuests: parseInt(data.maxGuests),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseFloat(data.bathrooms),
        pricePerNight: parseFloat(data.pricePerNight),
        isApproved: false, // Default to pending approval
        isActive: true,    // Default to active
        hostId,
    };

    const rental = await prisma.rental.create({
        data: formattedData,
        include: {
            host: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                },
            },
        },
    });

    // Update Search Index in Firestore (Option B)
    await AmenityService.updateSearchIndex(rental.id, rental);

    return rental;
}

/**
 * Fuzz Location Helper
 * Adds a random offset (approx 200-500m) to coordinates.
 * This prevents triangulation of the exact address.
 */
function fuzzLocation(lat, lng) {
    if (!lat || !lng) return { latitude: null, longitude: null };

    // 0.004 degrees is approx 400-500 meters
    const offsetLat = (Math.random() - 0.5) * 0.008;
    const offsetLng = (Math.random() - 0.5) * 0.008;

    return {
        latitude: lat + offsetLat,
        longitude: lng + offsetLng,
        isApproximate: true
    };
}

/**
 * Get rental by ID
 * @param {string} rentalId - Rental ID
 * @param {string} [viewerId] - ID of the user viewing the rental (optional)
 * @returns {Promise<Object>} Rental details
 */
async function getRentalById(rentalId, viewerId = null) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
            host: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    createdAt: true,
                },
            },
            reviews: {
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profileImageUrl: true,
                        },
                    },
                },
            },
            bookings: viewerId ? {
                where: {
                    guestId: viewerId,
                    status: 'CONFIRMED'
                },
                select: { id: true, status: true }
            } : false
        },
    });

    if (!rental) {
        throw new NotFoundError('Rental not found');
    }

    // Security Check: Hide exact location unless Viewer is Host or has Confirmed Booking
    const isHost = viewerId && rental.hostId === viewerId;
    const hasBooking = rental.bookings && rental.bookings.length > 0;

    if (!isHost && !hasBooking) {
        const fuzzed = fuzzLocation(rental.latitude, rental.longitude);
        rental.latitude = fuzzed.latitude;
        rental.longitude = fuzzed.longitude;
        rental.addressLine1 = null; // Hide exact address
        rental.addressLine2 = null;
        rental.isApproximateLocation = true;
    }

    // Remove internal booking info from result
    delete rental.bookings;

    return rental;
}

/**
 * Update rental listing
 * @param {string} rentalId - Rental ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated rental
 */
async function updateRental(rentalId, updates) {
    // Fields allowed to update
    const allowedUpdates = [
        'title', 'description', 'propertyType', 'addressLine1', 'addressLine2',
        'city', 'state', 'zipCode', 'country', 'latitude', 'longitude',
        'pricePerNight', 'cleaningFee', 'serviceFee', 'maxGuests',
        'bedrooms', 'beds', 'bathrooms', 'amenities', 'houseRules',
        'cancellationPolicy', 'minNights', 'maxNights', 'images',
        'mainImageIndex', 'isApproved', 'isActive'
    ];

    // Filter updates
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }

    // Validate amenities if present in updates
    if (filteredUpdates.amenities) {
        const { isValid, errors, values } = await AmenityService.validateAmenities(filteredUpdates.amenities);
        if (!isValid) {
            throw new BadRequestError(`Invalid amenities: ${errors.join(' ')}`);
        }
        filteredUpdates.amenities = values;
    }

    // Handle number conversions if present
    if (filteredUpdates.maxGuests) filteredUpdates.maxGuests = parseInt(filteredUpdates.maxGuests);
    if (filteredUpdates.bedrooms) filteredUpdates.bedrooms = parseInt(filteredUpdates.bedrooms);
    if (filteredUpdates.bathrooms) filteredUpdates.bathrooms = parseFloat(filteredUpdates.bathrooms);
    if (filteredUpdates.pricePerNight) filteredUpdates.pricePerNight = parseFloat(filteredUpdates.pricePerNight);

    try {
        const rental = await prisma.rental.update({
            where: { id: rentalId },
            data: {
                ...filteredUpdates,
                updatedAt: new Date(),
            },
        });

        // Update Search Index in Firestore (Option B)
        await AmenityService.updateSearchIndex(rental.id, rental);

        return rental;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new NotFoundError('Rental not found');
        }
        throw error;
    }
}

/**
 * Delete rental listing
 * @param {string} rentalId - Rental ID
 * @returns {Promise<void>}
 */
async function deleteRental(rentalId) {
    // Check existence (handled by middleware usually, but good for safety)
    // Also check for existing bookings?
    const bookingsCount = await prisma.booking.count({
        where: {
            rentalId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            endDate: { gte: new Date() } // Using endDate as approximation? Schema has checkOutDate.
        }
    });

    // Fix: Schema uses checkOutDate
    // Also re-check bookings query
    // Actually the previous code used `endDate`. Schema has `checkOutDate`. 
    // This is another bug I noticed just now reading the code! 
    // `endDate` likely throws error in Prisma if not exists.
}

// Wait, I need to fix checkOutDate issue too.
// I will rewrite deleteRental fully correct.

async function deleteRental(rentalId) {
    const bookingsCount = await prisma.booking.count({
        where: {
            rentalId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            checkOutDate: { gte: new Date() }
        }
    });

    if (bookingsCount > 0) {
        throw new BadRequestError('Cannot delete rental with active or future bookings');
    }

    try {
        await prisma.rental.delete({
            where: { id: rentalId },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw new NotFoundError('Rental not found');
        }
        throw error;
    }
}

/**
 * Search rentals with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Rentals and pagination
 */
async function searchRentals(filters) {
    const {
        city,
        state,
        zipCode,
        propertyType,
        maxGuests,
        bedrooms,
        bathrooms,
        minPrice,
        maxPrice,
        amenities,
        page = 1,
        limit = 20,
        search
    } = filters;

    const where = {
        isApproved: true,
        isActive: true,
    };

    // If amenities are provided, use the Firestore Search Index (Option B)
    if (amenities && Object.keys(amenities).length > 0) {
        const indexedIds = await AmenityService.searchInIndex(filters);
        if (indexedIds.length === 0) {
            return {
                rentals: [],
                pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 }
            };
        }
        where.id = { in: indexedIds };
    }

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (zipCode) where.zipCode = zipCode;
    if (propertyType) where.propertyType = propertyType;
    if (maxGuests) where.maxGuests = { gte: parseInt(maxGuests) };
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseFloat(bathrooms) };
    if (minPrice) where.pricePerNight = { ...where.pricePerNight, gte: parseFloat(minPrice) };
    if (maxPrice) where.pricePerNight = { ...where.pricePerNight, lte: parseFloat(maxPrice) };

    // Generic text search
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [rentals, total] = await Promise.all([
        prisma.rental.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                host: {
                    select: {
                        id: true,
                        firstName: true,
                        profileImageUrl: true,
                    },
                },
            },
        }),
        prisma.rental.count({ where }),
    ]);

    // Fuzz locations for search results (ALWAYS)
    const safeRentals = rentals.map(r => {
        const fuzzed = fuzzLocation(r.latitude, r.longitude);
        return {
            ...r,
            latitude: fuzzed.latitude,
            longitude: fuzzed.longitude,
            addressLine1: null, // Never show address in search
            addressLine2: null,
            isApproximateLocation: true
        };
    });

    return {
        rentals: safeRentals,
        pagination: {
            page: parseInt(page),
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
        },
    };
}

/**
 * Get rentals by host ID
 * @param {string} hostId - Host ID
 * @returns {Promise<Array>} List of rentals
 */
async function getRentalsByHost(hostId) {
    const rentals = await prisma.rental.findMany({
        where: { hostId },
        orderBy: { createdAt: 'desc' },
    });
    return rentals;
}

/**
 * Approve rental (Admin only)
 * @param {string} rentalId - Rental ID
 * @returns {Promise<Object>} Updated rental
 */
async function approveRental(rentalId) {
    try {
        return await prisma.rental.update({
            where: { id: rentalId },
            data: { isApproved: true },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw new NotFoundError('Rental not found');
        }
        throw error;
    }
}

module.exports = {
    createRental,
    getRentalById,
    updateRental,
    deleteRental,
    searchRentals,
    getRentalsByHost,
    approveRental,
};
