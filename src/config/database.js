const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * 
 * This ensures we only create one instance of PrismaClient
 * to avoid connection pool exhaustion in development.
 */

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
