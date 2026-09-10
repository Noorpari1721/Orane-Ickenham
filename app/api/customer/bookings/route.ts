import { NextResponse } from "next/server";

import { getCustomerSession } from "@/lib/customerAuth";
import { getCustomerPrisma } from "@/lib/customerDb";

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const prisma = getCustomerPrisma();

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.customer.id,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        bookingServices: {
          include: {
            service: true,
          },
        },
        tech: true,
        payment: true,
      },
    });

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingNo: booking.bookingNo,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        totalPrice: booking.bookingServices.reduce(
          (total, item) =>
            total +
            Number(item.service.price ?? 0) *
              Number(item.quantity ?? 1),
          0
        ),
        paymentStatus: booking.payment?.status ?? null,
        staff: booking.tech
          ? {
              firstName: booking.tech.firstName,
              lastName: booking.tech.lastName,
            }
          : null,
        services: booking.bookingServices.map((item) => ({
          id: item.service.id,
          name: item.service.name,
          quantity: Number(item.quantity ?? 1),
          price: Number(item.service.price ?? 0),
          duration: item.service.duration,
        })),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load bookings right now." },
      { status: 500 }
    );
  }
}