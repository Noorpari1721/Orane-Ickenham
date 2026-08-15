import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/adminAuth";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

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


function timeToMinutes(time: string | null | undefined) {
  if (!time) return -1;

  const parts = time.split(":").map(Number);

  if (
    parts.length < 2 ||
    Number.isNaN(parts[0]) ||
    Number.isNaN(parts[1])
  ) {
    return -1;
  }

  return parts[0] * 60 + parts[1];
}

function timesOverlap(
  startA: string,
  endA: string | null,
  startB: string,
  endB: string | null
) {
  const startAMinutes = timeToMinutes(startA);
  const endAMinutes = timeToMinutes(endA);
  const startBMinutes = timeToMinutes(startB);
  const endBMinutes = timeToMinutes(endB);

  if (
    startAMinutes < 0 ||
    startBMinutes < 0
  ) {
    return false;
  }

  if (
    endAMinutes < 0 ||
    endBMinutes < 0
  ) {
    return startAMinutes === startBMinutes;
  }

  return (
    startAMinutes < endBMinutes &&
    endAMinutes > startBMinutes
  );
}
function serializeBooking(booking: any) {
  return {
    id: booking.id,
    bookingNo: booking.bookingNo,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    notes: booking.notes,
    customer: {
      id: booking.customer.id,
      customerNo: booking.customer.customerNo,
      name: `${booking.customer.firstName} ${booking.customer.lastName}`,
      email: booking.customer.email,
      phone: booking.customer.phone,
    },
    service: {
      id: booking.service.id,
      serviceNo: booking.service.serviceNo,
      name: booking.service.name,
      category: booking.service.category,
      duration: booking.service.duration,
      price: Number(booking.service.price),
    },
    tech: booking.tech
      ? {
          id: booking.tech.id,
          techNo: booking.tech.techNo,
          name: `${booking.tech.firstName} ${booking.tech.lastName}`,
        }
      : null,
    payment: booking.payment
      ? {
          id: booking.payment.id,
          paymentNo: booking.payment.paymentNo,
          amount: Number(booking.payment.amount),
          method: booking.payment.method,
          status: booking.payment.status,
          transactionId: booking.payment.transactionId,
          paidAt: booking.payment.paidAt,
        }
      : null,
  };
}

const bookingInclude = {
  customer: true,
  service: true,
  tech: true,
  payment: true,
};

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const prisma = getPrisma();

    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: any = {};

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59.999`);

      where.date = {
        gte: start,
        lte: end,
      };
    }

    if (
      status &&
      [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ].includes(status)
    ) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({
      bookings: bookings.map(serializeBooking),
    });
  } catch (error) {
    console.error("GET /api/admin/bookings failed:", error);

    return NextResponse.json(
      { error: "Unable to load bookings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const customerId = String(body.customerId ?? "");
    const serviceId = String(body.serviceId ?? "");
    const techId = String(body.techId ?? "").trim() || null;
    const date = String(body.date ?? "");
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim() || null;
    const notes = String(body.notes ?? "").trim() || null;

    if (
      !customerId ||
      !serviceId ||
      !date ||
      !startTime
    ) {
      return NextResponse.json(
        {
          error:
            "Customer, service, date and start time are required.",
        },
        { status: 400 }
      );
    }

    const bookingDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid booking date." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const [customer, service, tech] =
      await Promise.all([
        prisma.customer.findUnique({
          where: { id: customerId },
        }),
        prisma.service.findUnique({
          where: { id: serviceId },
        }),
        techId
          ? prisma.tech.findUnique({
              where: { id: techId },
            })
          : Promise.resolve(null),
      ]);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        { error: "This service is inactive." },
        { status: 400 }
      );
    }

    if (techId && !tech) {
      return NextResponse.json(
        { error: "Technician not found." },
        { status: 404 }
      );
    }

    if (tech && tech.status === "UNAVAILABLE") {
      return NextResponse.json(
        {
          error:
            "This technician is currently unavailable.",
        },
        { status: 400 }
      );
    }

    if (techId) {
      const existingBookings =
        await prisma.booking.findMany({
          where: {
            techId,
            date: bookingDate,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        });

      const conflictingBooking =
        existingBookings.find((booking) =>
          timesOverlap(
            startTime,
            endTime,
            booking.startTime,
            booking.endTime
          )
        );

      if (conflictingBooking) {
        return NextResponse.json(
          {
            error:
              "This technician already has a booking at this time.",
          },
          { status: 409 }
        );
      }
    }

    const existingBookingNumbers =
      await prisma.booking.findMany({
        select: { bookingNo: true },
      });

    const highestBookingNumber =
      existingBookingNumbers.reduce(
        (highest, booking) => {
          const match = booking.bookingNo.match(/^BK-(\d+)$/);
          if (!match) return highest;

          return Math.max(
            highest,
            Number(match[1])
          );
        },
        0
      );

    const bookingNo = `BK-${String(
      highestBookingNumber + 1
    ).padStart(3, "0")}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNo,
        date: bookingDate,
        startTime,
        endTime,
        notes,
        customerId,
        serviceId,
        techId,
        status: "PENDING",
      },
      include: bookingInclude,
    });

    return NextResponse.json(
      {
        booking: serializeBooking(booking),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/bookings failed:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const id = String(body.id ?? "");
    const customerId = String(body.customerId ?? "");
    const serviceId = String(body.serviceId ?? "");
    const techId = String(body.techId ?? "").trim() || null;
    const date = String(body.date ?? "");
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim() || null;
    const notes = String(body.notes ?? "").trim() || null;

    if (
      !id ||
      !customerId ||
      !serviceId ||
      !date ||
      !startTime
    ) {
      return NextResponse.json(
        {
          error:
            "Booking ID, customer, service, date and start time are required.",
        },
        { status: 400 }
      );
    }

    const bookingDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid booking date." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const existingBooking =
      await prisma.booking.findUnique({
        where: { id },
      });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        { error: "This service is inactive." },
        { status: 400 }
      );
    }

    if (techId) {
      const tech = await prisma.tech.findUnique({
        where: { id: techId },
      });

      if (!tech) {
        return NextResponse.json(
          { error: "Technician not found." },
          { status: 404 }
        );
      }

      if (tech.status === "UNAVAILABLE") {
        return NextResponse.json(
          {
            error:
              "This technician is currently unavailable.",
          },
          { status: 400 }
        );
      }

      const existingBookings =
        await prisma.booking.findMany({
          where: {
            id: {
              not: id,
            },
            techId,
            date: bookingDate,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        });

      const conflictingBooking =
        existingBookings.find((booking) =>
          timesOverlap(
            startTime,
            endTime,
            booking.startTime,
            booking.endTime
          )
        );

      if (conflictingBooking) {
        return NextResponse.json(
          {
            error:
              "This technician already has a booking at this time.",
          },
          { status: 409 }
        );
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        customerId,
        serviceId,
        techId,
        date: bookingDate,
        startTime,
        endTime,
        notes,
      },
      include: bookingInclude,
    });

    return NextResponse.json({
      booking: serializeBooking(booking),
    });
  } catch (error) {
    console.error("PUT /api/admin/bookings failed:", error);

    return NextResponse.json(
      { error: "Unable to update booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const id = String(body.id ?? "");
    const status = String(body.status ?? "");

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Valid booking ID and status are required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: status as any,
      },
      include: bookingInclude,
    });

    return NextResponse.json({
      booking: serializeBooking(booking),
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/bookings failed:",
      error
    );

    return NextResponse.json(
      { error: "Unable to change booking status." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const id = String(body.id ?? "");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/bookings failed:",
      error
    );

    return NextResponse.json(
      { error: "Unable to delete booking." },
      { status: 500 }
    );
  }
}
