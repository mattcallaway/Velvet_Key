const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bookingService = require('../services/booking.service');
const rentalService = require('../services/rental.service');

async function main() {
    console.log('🧪 Starting Booking Logic Verification...');

    let hostId, guestId, rentalId, bookingId;

    try {
        // 1. Setup: Ensure we have a Host, a Guest, and a Rental
        console.log('\n--- Setup ---');

        // Find or create test users (using raw Prisma to bypass auth checks)
        // We'll use existing users if possible or create dummies
        const users = await prisma.user.findMany({ take: 2 });
        if (users.length < 2) {
            console.log('⚠️ Not enough users found. Please create users via API first or run seed.');
            return;
        }
        hostId = users[0].id; // First user as Host
        guestId = users[1].id; // Second user as Guest

        console.log(`Host: ${hostId}`);
        console.log(`Guest: ${guestId}`);

        // Create a test rental (if host doesn't have one)
        const hostRentals = await prisma.rental.findMany({ where: { hostId } });
        if (hostRentals.length > 0) {
            rentalId = hostRentals[0].id;
            console.log(`Using existing rental: ${rentalId}`);
        } else {
            console.log('Creating test rental...');
            const rental = await rentalService.createRental(hostId, {
                title: "Test Villa Verification",
                description: "A beautiful test villa for verification script.",
                propertyType: "VILLA",
                addressLine1: "123 Test St",
                city: "Test City",
                state: "TC",
                zipCode: "12345",
                country: "US",
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 2,
                pricePerNight: 100,
                cleaningFee: 50
            });
            rentalId = rental.id;
            // Admin approve it so it's bookable
            await prisma.rental.update({
                where: { id: rentalId },
                data: { isApproved: true, isActive: true }
            });
            console.log(`Created test rental: ${rentalId}`);
        }

        // 2. Test Booking Creation (Success Case)
        console.log('\n--- Test 1: Create Valid Booking ---');
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const checkIn = new Date(nextMonth);
        checkIn.setDate(10); // 10th of next month
        const checkOut = new Date(nextMonth);
        checkOut.setDate(15); // 15th of next month (5 nights)

        try {
            const booking = await bookingService.createBooking(guestId, {
                rentalId,
                checkInDate: checkIn.toISOString(),
                checkOutDate: checkOut.toISOString(),
                numberOfGuests: 2,
                guestMessage: "Testing availability"
            });
            bookingId = booking.id;
            console.log('✅ Booking Created Successfully:', booking.id);
            console.log('   Price:', booking.totalPrice);

            // Validate Math: 5 nights * 100 + 50 cleaning + 10% fee
            // Subtotal = 500. Cleaning = 50. Service = 50. Total = 600.
            const expectedTotal = 600;
            if (Number(booking.totalPrice) === expectedTotal) {
                console.log('✅ Pricing Calculation Correct');
            } else {
                console.error(`❌ Pricing Mismatch! Expected ${expectedTotal}, got ${booking.totalPrice}`);
            }

        } catch (error) {
            console.error('❌ Failed to create valid booking:', error.message);
        }

        // 3. Test Availability (Overlap Case)
        console.log('\n--- Test 2: Detect Overlap ---');
        try {
            await bookingService.createBooking(guestId, {
                rentalId,
                checkInDate: checkIn.toISOString(), // Same dates!
                checkOutDate: checkOut.toISOString(),
                numberOfGuests: 2
            });
            console.error('❌ Failed: Duplicate booking should have thrown ConflictError');
        } catch (error) {
            if (error.message.includes('not available')) {
                console.log('✅ Overlap Detected Correctly (ConflictError thrown)');
            } else {
                console.error('❌ Unexpected error during overlap check:', error);
            }
        }

        // 4. Test Status Update
        console.log('\n--- Test 3: Host Confirm ---');
        try {
            const confirmed = await bookingService.updateBookingStatus(bookingId, hostId, 'CONFIRMED');
            if (confirmed.status === 'CONFIRMED') {
                console.log('✅ Status Updated to CONFIRMED');
            } else {
                console.error('❌ Status update failed:', confirmed.status);
            }
        } catch (error) {
            console.error('❌ Failed to update status:', error.message);
        }

    } catch (error) {
        console.error('CRITICAL FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
