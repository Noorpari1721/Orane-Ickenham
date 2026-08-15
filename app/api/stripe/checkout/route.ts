import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeSecretKey);

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

type CheckoutRequest = {
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  staffId?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CheckoutRequest;

    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      staffId,
    } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service is required." },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        {
          error:
            "Customer name and email are required.",
        },
        { status: 400 }
      );
    }

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        {
          error:
            "Appointment date and time are required.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    /*
     * The booking UI uses numeric service IDs such as "1".
     *
     * The database uses:
     *
     *   Service.id       = CUID
     *   Service.serviceNo = SRV-001, SRV-002, ...
     *
     * Therefore:
     *
     *   "1" -> serviceNo "SRV-001"
     *
     * Existing CUID IDs continue to use Service.id.
     */

    const rawServiceId =
      String(serviceId).trim();

    const isNumericServiceId =
      /^\d+$/.test(rawServiceId);

    const service =
      isNumericServiceId
        ? await prisma.service.findUnique({
            where: {
              serviceNo:
                `SRV-${rawServiceId.padStart(3, "0")}`,
            },
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
              category: true,
              active: true,
            },
          })
        : await prisma.service.findUnique({
            where: {
              id: rawServiceId,
            },
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
              category: true,
              active: true,
            },
          });

    if (!service || !service.active) {
      return NextResponse.json(
        {
          error:
            "The selected service is no longer available.",
        },
        { status: 400 }
      );
    }

    const trustedPrice =
      Number(service.price);

    if (
      !Number.isFinite(trustedPrice) ||
      trustedPrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The selected service has an invalid price.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify internally assigned technician.
     * Customer never chooses the technician.
     */

    let verifiedStaffId = "";

    if (staffId) {
      const tech =
        await prisma.tech.findUnique({
          where: {
            id: staffId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (
        tech &&
        tech.status === "AVAILABLE"
      ) {
        verifiedStaffId = tech.id;
      }
    }

    const origin =
      new URL(request.url).origin;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email: customerEmail,

        line_items: [
          {
            price_data: {
              currency: "gbp",

              product_data: {
                name: service.name,
                description:
                  `${service.duration} minute appointment at ORANE Ickenham`,
              },

              unit_amount:
                Math.round(
                  trustedPrice * 100
                ),
            },

            quantity: 1,
          },
        ],

        metadata: {
          serviceId: service.id,
          serviceName: service.name,
          customerName,
          customerEmail,
          customerPhone:
            customerPhone ?? "",
          category:
            service.category ?? "",
          staffId: verifiedStaffId,
          appointmentDate,
          appointmentTime,
          duration:
            String(service.duration),
          price:
            trustedPrice.toFixed(2),
        },

        success_url:
          `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/booking`,
      });

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe Checkout URL was not created.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {

    console.error(
      "Stripe Checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create Stripe Checkout session.",
      },
      { status: 500 }
    );
  }
}