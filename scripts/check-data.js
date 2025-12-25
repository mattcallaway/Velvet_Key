const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.count();
        const rentals = await prisma.rental.count();
        const bookings = await prisma.booking.count();
        console.log(`\n📊 CURRENT DATABASE STATUS:`);
        console.log(`- Users:    ${users}`);
        console.log(`- Rentals:  ${rentals}`);
        console.log(`- Bookings: ${bookings}\n`);
    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
