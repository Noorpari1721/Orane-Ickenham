import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  publicServicesPrisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.publicServicesPrisma) {
    return globalForPrisma.publicServicesPrisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  globalForPrisma.publicServicesPrisma = prisma;

  return prisma;
}

export async function GET() {
  try {
    const prisma = getPrisma();

    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          price: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        serviceNo: true,
        name: true,
        category: true,
        description: true,
        duration: true,
        price: true,
      },
    });

    return NextResponse.json(
      {
        services: services.map((service) => ({
          id: service.id,
          serviceNo: service.serviceNo,
          name: service.name,
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: Number(service.price),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/services failed:", error);

    return NextResponse.json(
      {
        error: "Unable to load services.",
      },
      {
        status: 500,
      }
    );
  }
}