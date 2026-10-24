import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Only set WebSocket constructor if not already set
if (ws) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

// Prevent multiple instances of Prisma Client in development/serverless
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;