import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma as PrismaClient | undefined;
  // Dev HMR can keep a PrismaClient generated before schema changes.
  if (cached && !("pageView" in (cached as object))) {
    void (cached as PrismaClient).$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
    return createPrismaClient();
  }
  return cached ?? createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
