import { PrismaClient } from '@prisma/client';

// To prevent multiple instances of Prisma Client in development
const globalForPrisma = global;

// Check if we already have a Prisma instance
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Only save to global in development to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;