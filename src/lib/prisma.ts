import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRev?: number;
};

/** Bump when Prisma schema fields change so Next.js HMR does not keep a stale client. */
const PRISMA_SCHEMA_REV = 3;

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && globalForPrisma.prismaRev !== PRISMA_SCHEMA_REV) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaRev = PRISMA_SCHEMA_REV;
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
