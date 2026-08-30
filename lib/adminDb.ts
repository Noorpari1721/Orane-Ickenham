import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  adminPrisma?: PrismaClient;
};

export function getAdminPrisma() {
  if (globalForPrisma.adminPrisma) {
    return globalForPrisma.adminPrisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured."
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.adminPrisma = prisma;
  }

  return prisma;
}
