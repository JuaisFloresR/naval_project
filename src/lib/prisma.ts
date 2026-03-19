import { PrismaClient } from '@/generated/prisma';

// 1. Definimos una variable global para evitar múltiples instancias en desarrollo (Singleton)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Exportamos la instancia de prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Opcional: útil para debugear tus consultas en la consola
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 3. Guardamos la instancia en global si no estamos en producción
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;