import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  // Dev HMR can keep a PrismaClient generated before schema changes (e.g. PageView).
  if (cached && !("pageView" in cached)) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
    return createPrismaClient();
  }
  return cached ?? createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
