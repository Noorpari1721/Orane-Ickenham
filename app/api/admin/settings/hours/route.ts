import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/adminAuth";

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

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

async function requireAdmin() {
  const cookieStore = await cookies();

  return verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE)?.value
  );
}

const DEFAULT_HOURS = [
  {
    dayOfWeek: 0,
    day: "Sunday",
    isOpen: true,
    openTime: "09:00",
    closeTime: "17:00",
  },
  {
    dayOfWeek: 1,
    day: "Monday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 2,
    day: "Tuesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 3,
    day: "Wednesday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 4,
    day: "Thursday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 5,
    day: "Friday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
  {
    dayOfWeek: 6,
    day: "Saturday",
    isOpen: true,
    openTime: "10:00",
    closeTime: "19:00",
  },
];

function dayName(dayOfWeek: number) {
  return (
    DEFAULT_HOURS.find(
      (item) => item.dayOfWeek === dayOfWeek
    )?.day ?? ""
  );
}

function isValidTime(value: unknown) {
  return (
    typeof value === "string" &&
    /^\d{2}:\d{2}$/.test(value) &&
    Number(value.slice(0, 2)) >= 0 &&
    Number(value.slice(0, 2)) <= 23 &&
    Number(value.slice(3, 5)) >= 0 &&
    Number(value.slice(3, 5)) <= 59
  );
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const prisma = getPrisma();

    let hours = await prisma.salonWorkingHour.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    /*
     * The Prisma model only contains:
     * dayOfWeek, isOpen, openTime and closeTime.
     *
     * Do not write the display-only "day" property
     * into the database.
     */
    if (hours.length !== 7) {
      await prisma.$transaction(
        DEFAULT_HOURS.map((item) =>
          prisma.salonWorkingHour.upsert({
            where: {
              dayOfWeek: item.dayOfWeek,
            },
            update: {},
            create: {
              dayOfWeek: item.dayOfWeek,
              isOpen: item.isOpen,
              openTime: item.openTime,
              closeTime: item.closeTime,
            },
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
        day: dayName(item.dayOfWeek),
        isOpen: item.isOpen,
        openTime: item.openTime ?? "",
        closeTime: item.closeTime ?? "",
      })),
    });
  } catch (error) {
    console.error("GET working hours error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load working hours.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const hours = Array.isArray(body.hours) ? body.hours : [];

    if (hours.length !== 7) {
      return NextResponse.json(
        {
          success: false,
          error: "Exactly seven working-hour records are required.",
        },
        { status: 400 }
      );
    }

    const seenDays = new Set<number>();

    for (const item of hours) {
      const dayOfWeek = Number(item?.dayOfWeek);

      if (
        !Number.isInteger(dayOfWeek) ||
        dayOfWeek < 0 ||
        dayOfWeek > 6 ||
        seenDays.has(dayOfWeek) ||
        typeof item?.isOpen !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid working-hour data.",
          },
          { status: 400 }
        );
      }

      seenDays.add(dayOfWeek);

      if (item.isOpen) {
        if (
          !isValidTime(item.openTime) ||
          !isValidTime(item.closeTime)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid time for ${dayName(dayOfWeek)}.`,
            },
            { status: 400 }
          );
        }

        const openMinutes =
          Number(String(item.openTime).slice(0, 2)) * 60 +
          Number(String(item.openTime).slice(3, 5));

        const closeMinutes =
          Number(String(item.closeTime).slice(0, 2)) * 60 +
          Number(String(item.closeTime).slice(3, 5));

        if (closeMinutes <= openMinutes) {
          return NextResponse.json(
            {
              success: false,
              error: `Closing time must be after opening time for ${dayName(
                dayOfWeek
              )}.`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (seenDays.size !== 7) {
      return NextResponse.json(
        {
          success: false,
          error: "All seven days are required.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    await prisma.$transaction(
      hours.map((item: {
        dayOfWeek: number;
        isOpen: boolean;
        openTime?: string;
        closeTime?: string;
      }) =>
        prisma.salonWorkingHour.upsert({
          where: {
            dayOfWeek: Number(item.dayOfWeek),
          },
          update: {
            isOpen: Boolean(item.isOpen),
            openTime: item.isOpen ? String(item.openTime) : null,
            closeTime: item.isOpen ? String(item.closeTime) : null,
          },
          create: {
            dayOfWeek: Number(item.dayOfWeek),
            isOpen: Boolean(item.isOpen),
            openTime: item.isOpen ? String(item.openTime) : null,
            closeTime: item.isOpen ? String(item.closeTime) : null,
          },
        })
      )
    );

    const updated = await prisma.salonWorkingHour.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      hours: updated.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        day: dayName(item.dayOfWeek),
        isOpen: item.isOpen,
        openTime: item.openTime ?? "",
        closeTime: item.closeTime ?? "",
      })),
    });
  } catch (error) {
    console.error("PUT working hours error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to save working hours.",
      },
      { status: 500 }
    );
  }
}
