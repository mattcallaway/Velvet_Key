const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.rental.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data');

    // 1. Admin
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@velvetkey.com',
            firebaseUid: 'seed-admin-uid',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User',
            dateOfBirth: new Date('1990-01-01'),
            emailVerified: true,
            identityVerified: true,
        },
    });

    // 2. Host
    const hostUser = await prisma.user.create({
        data: {
            email: 'host@example.com',
            firebaseUid: 'seed-host-uid',
            role: 'HOST',
            firstName: 'Victoria',
            lastName: 'Sterling',
            dateOfBirth: new Date('1988-06-15'),
            phoneNumber: '+1-555-0101',
            bio: 'Curator of exclusive nightlife experiences. My properties are designed for unforgettable evenings.',
            screenName: 'V. Sterling',
            genderIdentity: 'Female',
            location: 'Los Angeles, CA',
            emailVerified: true,
            phoneVerified: true,
            identityVerified: true,
            profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
        },
    });

    // 3. Guest
    const guestUser = await prisma.user.create({
        data: {
            email: 'guest@example.com',
            firebaseUid: 'seed-guest-uid',
            role: 'GUEST',
            firstName: 'Julian',
            lastName: 'Assad',
            dateOfBirth: new Date('1992-03-20'),
            phoneNumber: '+1-555-0102',
            bio: 'Always looking for the next hidden gem.',
            screenName: 'Jules',
            location: 'New York, NY',
            emailVerified: true,
            identityVerified: true,
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
        },
    });

    console.log('✅ Created users');

    // 4. Listings
    const listings = [
        {
            title: 'The Midnight Penthouse',
            description: 'Experience the pinnacle of luxury in this exclusive downtown penthouse. Features a private rooftop infinity pool, floor-to-ceiling windows with panoramic city views, and a state-of-the-art sound system.',
            propertyType: 'PENTHOUSE',
            addressLine1: '101 Skyline Dr',
            city: 'Los Angeles',
            state: 'CA',
            maxGuests: 10,
            bedrooms: 3,
            bathrooms: 3.5,
            pricePerNight: 1200.00,
            amenities: ['Rooftop Pool', 'City Views', 'Sound System', 'Private Elevator', 'Chef\'s Kitchen'],
            images: [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1000'
            ]
        },
        {
            title: 'The Velvet Lounge',
            description: 'A discreet and moodily lit sanctuary perfect for intimate gatherings. Features a fully stocked vintage bar, velvet seating, and an atmosphere of pure sophistication.',
            propertyType: 'LOFT',
            addressLine1: '55 Secret Alley',
            city: 'New York',
            state: 'NY',
            maxGuests: 6,
            bedrooms: 1,
            bathrooms: 1.5,
            pricePerNight: 850.00,
            amenities: ['Vintage Bar', 'Mood Lighting', 'Soundproofing', 'VIP Entrance'],
            images: [
                'https://images.unsplash.com/photo-1550950356-820875953051?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=1000'
            ]
        },
        {
            title: 'Neon Industrial Loft',
            description: 'Raw concrete meets neon art in this edgy industrial loft. Perfect for photoshoots or pre-club drinks.',
            propertyType: 'LOFT',
            addressLine1: '777 Warehouse District',
            city: 'Chicago',
            state: 'IL',
            maxGuests: 8,
            bedrooms: 2,
            bathrooms: 2,
            pricePerNight: 450.00,
            amenities: ['Neon Art', 'Concrete Floors', 'High Ceilings', 'Photo Studio'],
            images: [
                'https://images.unsplash.com/photo-1534349762913-c6eb3d1339af?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1518291344630-4857135fb581?auto=format&fit=crop&q=80&w=1000'
            ]
        }
    ];

    for (const listing of listings) {
        await prisma.rental.create({
            data: {
                hostId: hostUser.id,
                title: listing.title,
                description: listing.description,
                propertyType: listing.propertyType,
                addressLine1: listing.addressLine1,
                city: listing.city,
                state: listing.state,
                zipCode: '00000',
                country: 'US',
                latitude: 0,
                longitude: 0,
                maxGuests: listing.maxGuests,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                pricePerNight: listing.pricePerNight,
                amenities: JSON.stringify(listing.amenities),
                images: JSON.stringify(listing.images),
                isActive: true,
                isApproved: true,
            }
        });
    }
    console.log(`✅ Created ${listings.length} premium listings`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📧 Credentials:');
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
