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

function toMinutes(value: string | null | undefined) {
  if (!value) return -1;

  const parts = value.split(":").map(Number);

  if (
    parts.length !== 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {
    return -1;
  }

  return parts[0] * 60 + parts[1];
}

function to24Hour(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;
}

function toDisplayTime(value: string) {
  const [hourText, minute] = value.split(":");

  let hour = Number(hourText);

  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${period}`;
}

function getLondonParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) =>
    Number(
      parts.find((part) => part.type === type)?.value ?? 0
    );

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function isTodayInLondon(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const now = getLondonParts();

  return (
    year === now.year &&
    month === now.month &&
    day === now.day
  );
}

function getDayOfWeek(
  year: number,
  month: number,
  day: number
) {
  return new Date(
    Date.UTC(year, month - 1, day)
  ).getUTCDay();
}

async function findService(
  prisma: PrismaClient,
  rawServiceId: string
) {
  const directService = await prisma.service.findUnique({
    where: {
      id: rawServiceId,
    },
  });

  if (directService) {
    return directService;
  }

  const numericId = Number(rawServiceId);

  if (
    Number.isInteger(numericId) &&
    numericId > 0
  ) {
    const serviceNo = `SRV-${String(numericId).padStart(
      3,
      "0"
    )}`;

    const numberedService =
      await prisma.service.findUnique({
        where: {
          serviceNo,
        },
      });

    if (numberedService) {
      return numberedService;
    }
  }

  return null;
}

function getTechImage(techNo: string) {
  const avatarMap: Record<string, string> = {
    "TECH-001":
      "/images/staff/tech-001-gurpreet.jpg",
    "TECH-002":
      "/images/staff/tech-002-sneha.jpg",
    "TECH-003":
      "/images/staff/tech-003-kavita.jpg",
    "TECH-004":
      "/images/staff/tech-004-muskan.jpg",
  };

  return (
    avatarMap[techNo] ||
    "/images/staff/tech-placeholder.jpg"
  );
}

export async function GET(request: Request) {
  try {
    const prisma = getPrisma();

    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!date || !serviceId) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          slots: [],
          error:
            "Date and service are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          slots: [],
          error: "Invalid appointment date.",
        },
        { status: 400 }
      );
    }

    const service = await findService(
      prisma,
      serviceId
    );

    if (!service || !service.active) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          slots: [],
          error:
            "Selected service is unavailable.",
        },
        { status: 404 }
      );
    }

    const [year, month, day] =
      date.split("-").map(Number);

    const dayOfWeek = getDayOfWeek(
      year,
      month,
      day
    );

    const workingHours =
      await prisma.salonWorkingHour.findUnique({
        where: {
          dayOfWeek,
        },
      });

    if (
      !workingHours ||
      !workingHours.isOpen
    ) {
      return NextResponse.json({
        success: true,
        available: false,
        slots: [],
        reason:
          "The salon is closed on this date.",
      });
    }

    const openMinutes = toMinutes(
      workingHours.openTime
    );

    const closeMinutes = toMinutes(
      workingHours.closeTime
    );

    const duration = Number(service.duration);

    if (
      openMinutes < 0 ||
      closeMinutes <= openMinutes ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          slots: [],
          error:
            "Opening hours or service duration is invalid.",
        },
        { status: 500 }
      );
    }

    const startOfDay = new Date(
      year,
      month - 1,
      day,
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59,
      999
    );

    /*
     * Staff is no longer selected by the customer.
     *
     * We automatically consider all available
     * technicians and assign one when a time is selected.
     */
    const technicians =
      await prisma.tech.findMany({
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
        },
      });

    if (technicians.length === 0) {
      return NextResponse.json({
        success: true,
        available: false,
        slots: [],
        reason:
          "No specialists are currently available.",
      });
    }

    const techIds = technicians.map(
      (tech) => tech.id
    );

    const existingBookings =
      await prisma.booking.findMany({
        where: {
          techId: {
            in: techIds,
          },
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: [
              "PENDING",
              "CONFIRMED",
            ],
          },
        },
        select: {
          techId: true,
          startTime: true,
          endTime: true,
          service: {
            select: {
              duration: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

    const londonNow =
      getLondonParts();

    const currentLondonMinutes =
      londonNow.hour * 60 +
      londonNow.minute;

    const slots: {
      time: string;
      techId: string;
      techNo: string;
      techName: string;
      role: string;
      image: string;
    }[] = [];

    /*
     * Generate 30-minute appointment slots.
     *
     * For every slot we find the first technician
     * who is not already booked during that period.
     */
    for (
      let start = openMinutes;
      start + duration <= closeMinutes;
      start += 30
    ) {
      const end = start + duration;

      if (
        isTodayInLondon(date) &&
        start <= currentLondonMinutes
      ) {
        continue;
      }

      const availableTech =
        technicians.find((tech) => {
          const techBookings =
            existingBookings.filter(
              (booking) =>
                booking.techId === tech.id
            );

          const conflict =
            techBookings.some(
              (booking) => {
                const bookingStart =
                  toMinutes(
                    booking.startTime
                  );

                const savedEnd =
                  toMinutes(
                    booking.endTime
                  );

                const bookingEnd =
                  savedEnd >= 0
                    ? savedEnd
                    : bookingStart +
                      Number(
                        booking.service
                          .duration
                      );

                return (
                  start < bookingEnd &&
                  end > bookingStart
                );
              }
            );

          return !conflict;
        });

      if (!availableTech) {
        continue;
      }

      slots.push({
        time: toDisplayTime(
          to24Hour(start)
        ),
        techId: availableTech.id,
        techNo: availableTech.techNo,
        techName:
          `${availableTech.firstName} ${availableTech.lastName}`.trim(),
        role:
          availableTech.role ||
          "Beauty Specialist",
        image: getTechImage(
          availableTech.techNo
        ),
      });
    }

    return NextResponse.json({
      success: true,
      available: slots.length > 0,
      slots,
      date,

      service: {
        id: service.id,
        serviceNo: service.serviceNo,
        name: service.name,
        duration: service.duration,
        price: Number(service.price),
      },

      workingHours: {
        dayOfWeek,
        open: workingHours.openTime,
        close: workingHours.closeTime,
      },
    });
  } catch (error) {
    console.error(
      "BOOKING AVAILABILITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        available: false,
        slots: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load appointment availability.",
      },
      { status: 500 }
    );
  }
}
