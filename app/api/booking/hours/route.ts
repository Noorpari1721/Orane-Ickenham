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

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const defaults = [
  { dayOfWeek: 0, isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { dayOfWeek: 1, isOpen: true, openTime: "10:00", closeTime: "19:00" },
  { dayOfWeek: 2, isOpen: true, openTime: "10:00", closeTime: "19:00" },
  { dayOfWeek: 3, isOpen: true, openTime: "10:00", closeTime: "19:00" },
  { dayOfWeek: 4, isOpen: true, openTime: "10:00", closeTime: "19:00" },
  { dayOfWeek: 5, isOpen: true, openTime: "10:00", closeTime: "19:00" },
  { dayOfWeek: 6, isOpen: true, openTime: "10:00", closeTime: "19:00" },
];

export async function GET() {
  try {
    const prisma = getPrisma();

    let hours = await prisma.salonWorkingHour.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    if (hours.length !== 7) {
      await prisma.$transaction(
        defaults.map((item) =>
          prisma.salonWorkingHour.upsert({
            where: {
              dayOfWeek: item.dayOfWeek,
            },
            update: {},
            create: item,
          })
        )
      );

      hours = await prisma.salonWorkingHour.findMany({
        orderBy: {
          dayOfWeek: "asc",
        },
      });
    }

    return NextResponse.json({
      success: true,
      hours: hours.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        day: dayNames[item.dayOfWeek],
        isOpen: item.isOpen,
        openTime: item.openTime ?? "",
        closeTime: item.closeTime ?? "",
      })),
    });
  } catch (error) {
    console.error("GET /api/booking/hours failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load salon working hours.",
      },
      {
        status: 500,
      }
    );
  }
}
