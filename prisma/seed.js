const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data (optional - comment out if you want to preserve data)
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.rental.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data');

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@velvetkey.com',
            passwordHash,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
            dateOfBirth: new Date('1990-01-01'),
            emailVerified: true,
            identityVerified: true,
        },
    });
    console.log('✅ Created admin user');

    const hostUser = await prisma.user.create({
        data: {
            email: 'host@example.com',
            passwordHash,
            role: 'HOST',
            firstName: 'Sarah',
            lastName: 'Johnson',
            dateOfBirth: new Date('1985-06-15'),
            phoneNumber: '+1-555-0101',
            bio: 'Experienced host with multiple properties. Committed to providing exceptional experiences.',
            emailVerified: true,
            phoneVerified: true,
            identityVerified: true,
        },
    });
    console.log('✅ Created host user');

    const guestUser = await prisma.user.create({
        data: {
            email: 'guest@example.com',
            passwordHash,
            role: 'GUEST',
            firstName: 'Michael',
            lastName: 'Chen',
            dateOfBirth: new Date('1992-03-20'),
            phoneNumber: '+1-555-0102',
            emailVerified: true,
            identityVerified: true,
        },
    });
    console.log('✅ Created guest user');

    // Create test rentals
    const rental1 = await prisma.rental.create({
        data: {
            hostId: hostUser.id,
            title: 'Luxury Villa with Private Pool',
            description: 'Stunning 5-bedroom villa perfect for private events. Features include heated pool, hot tub, full bar, and complete privacy on 2 acres.',
            propertyType: 'VILLA',
            addressLine1: '123 Sunset Boulevard',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90028',
            country: 'US',
            latitude: 34.0928,
            longitude: -118.3287,
            maxGuests: 12,
            bedrooms: 5,
            bathrooms: 4.5,
            minimumAge: 21,
            pricePerNight: 850.00,
            cleaningFee: 200.00,
            securityDeposit: 1000.00,
            amenities: JSON.stringify([
                'Pool',
                'Hot Tub',
                'Full Bar',
                'Sound System',
                'Privacy Fence',
                'Outdoor Kitchen',
                'Fire Pit',
            ]),
            houseRules: JSON.stringify([
                'No smoking indoors',
                'Respect quiet hours (11 PM - 8 AM)',
                'Maximum occupancy strictly enforced',
                'Must be 21+ to book',
            ]),
            images: JSON.stringify([
                '/uploads/villa1-main.jpg',
                '/uploads/villa1-pool.jpg',
                '/uploads/villa1-bedroom.jpg',
            ]),
            isActive: true,
            isApproved: true,
        },
    });
    console.log('✅ Created rental 1');

    const rental2 = await prisma.rental.create({
        data: {
            hostId: hostUser.id,
            title: 'Modern Downtown Loft',
            description: 'Sleek 2-bedroom loft in the heart of downtown. Perfect for intimate gatherings with city views.',
            propertyType: 'APARTMENT',
            addressLine1: '456 Main Street',
            addressLine2: 'Unit 1205',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'US',
            latitude: 37.7749,
            longitude: -122.4194,
            maxGuests: 6,
            bedrooms: 2,
            bathrooms: 2,
            minimumAge: 25,
            pricePerNight: 450.00,
            cleaningFee: 100.00,
            amenities: JSON.stringify([
                'City Views',
                'Modern Kitchen',
                'High-Speed WiFi',
                'Smart TV',
                'Secure Building',
            ]),
            houseRules: JSON.stringify([
                'No parties',
                'No smoking',
                'Respect building quiet hours',
            ]),
            images: JSON.stringify([
                '/uploads/loft1-main.jpg',
                '/uploads/loft1-living.jpg',
            ]),
            isActive: true,
            isApproved: true,
        },
    });
    console.log('✅ Created rental 2');

    // Create a test booking
    const booking = await prisma.booking.create({
        data: {
            rentalId: rental1.id,
            guestId: guestUser.id,
            checkInDate: new Date('2025-02-14'),
            checkOutDate: new Date('2025-02-16'),
            numberOfGuests: 8,
            pricePerNight: 850.00,
            numberOfNights: 2,
            subtotal: 1700.00,
            cleaningFee: 200.00,
            serviceFee: 190.00,
            totalPrice: 2090.00,
            status: 'CONFIRMED',
            guestMessage: 'Looking forward to celebrating a special occasion!',
        },
    });
    console.log('✅ Created test booking');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('Admin: admin@velvetkey.com / password123');
    console.log('Host:  host@example.com / password123');
    console.log('Guest: guest@example.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
