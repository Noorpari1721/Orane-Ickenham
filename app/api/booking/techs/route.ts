import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const runtime = "nodejs";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

function getTechImage(techNo: string) {
  const avatarMap: Record<string, string> = {
    "TECH-001": "/images/staff/tech-001-gurpreet.jpg",
    "TECH-002": "/images/staff/tech-002-sneha.jpg",
    "TECH-003": "/images/staff/tech-003-kavita.jpg",
    "TECH-004": "/images/staff/tech-004-muskan.jpg",
  };

  return (
    avatarMap[techNo] ||
    "/images/staff/tech-placeholder.jpg"
  );
}

export async function GET() {
  try {
    const prisma = getPrisma();

    const techs = await prisma.tech.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        techNo: "asc",
      },
      select: {
        id: true,
        techNo: true,
        firstName: true,
        lastName: true,
        role: true,
        experience: true,
        specialties: true,
        status: true,
      },
    });

    return NextResponse.json({
      techs: techs.map((tech) => ({
        id: tech.id,
        techNo: tech.techNo,
        name: `${tech.firstName} ${tech.lastName}`.trim(),
        role: tech.role || "Beauty Specialist",
        experience:
          tech.experience > 0
            ? `${tech.experience} Years Experience`
            : "",
        specialties: tech.specialties,
        status: tech.status,
        image: getTechImage(tech.techNo),
      })),
    });
  } catch (error) {
    console.error(
      "GET /api/booking/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load available specialists.",
      },
      {
        status: 500,
      }
    );
  }
}