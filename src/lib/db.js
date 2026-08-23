import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Inisialisasi Prisma v5 standar yang bersih dan aman untuk development Next.js
export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}