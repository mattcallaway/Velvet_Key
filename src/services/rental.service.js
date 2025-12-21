const prisma = require('../config/database');

/**
 * Rental Service
 * 
 * Business logic for rental property management
 */

/**
 * Create a new rental listing
 * @param {string} hostId - ID of the host creating the rental
 * @param {Object} data - Rental data
 * @returns {Promise<Object>} Created rental
 */
async function createRental(hostId, data) {
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

    return rental;
}

/**
 * Get rental by ID
 * @param {string} rentalId - Rental ID
 * @returns {Promise<Object>} Rental details
 */
async function getRentalById(rentalId) {
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
        },
    });

    if (!rental) {
        const error = new Error('Rental not found');
        error.statusCode = 404;
        error.code = 'RENTAL_NOT_FOUND';
        throw error;
    }

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
        'mainImageIndex', 'isApproved', 'isActive' // Only admin should theoretically update status manually here, ideally separate
    ];

    // Filter updates
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }

    // Handle number conversions if present
    if (filteredUpdates.maxGuests) filteredUpdates.maxGuests = parseInt(filteredUpdates.maxGuests);
    if (filteredUpdates.bedrooms) filteredUpdates.bedrooms = parseInt(filteredUpdates.bedrooms);
    if (filteredUpdates.bathrooms) filteredUpdates.bathrooms = parseFloat(filteredUpdates.bathrooms);
    if (filteredUpdates.pricePerNight) filteredUpdates.pricePerNight = parseFloat(filteredUpdates.pricePerNight);

    const rental = await prisma.rental.update({
        where: { id: rentalId },
        data: {
            ...filteredUpdates,
            updatedAt: new Date(),
        },
    });

    return rental;
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
            endDate: { gte: new Date() }
        }
    });

    if (bookingsCount > 0) {
        const error = new Error('Cannot delete rental with active or future bookings');
        error.statusCode = 400;
        error.code = 'HAS_ACTIVE_BOOKINGS';
        throw error;
    }

    await prisma.rental.delete({
        where: { id: rentalId },
    });
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
        search // Generic search term
    } = filters;

    const where = {
        isApproved: true, // Only show approved rentals publically
        isActive: true,
    };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (zipCode) where.zipCode = zipCode;
    if (propertyType) where.propertyType = propertyType;
    if (maxGuests) where.maxGuests = { gte: parseInt(maxGuests) };
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseFloat(bathrooms) };
    if (minPrice) where.pricePerNight = { ...where.pricePerNight, gte: parseFloat(minPrice) };
    if (maxPrice) where.pricePerNight = { ...where.pricePerNight, lte: parseFloat(maxPrice) };

    if (amenities && Array.isArray(amenities)) {
        where.amenities = {
            hasEvery: amenities,
        };
    }

    // Generic text search on title or description
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

    return {
        rentals,
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
    return await prisma.rental.update({
        where: { id: rentalId },
        data: { isApproved: true },
    });
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
