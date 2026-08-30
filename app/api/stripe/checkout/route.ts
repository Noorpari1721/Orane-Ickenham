import { NextResponse } from "next/server";
import { getDurationMinutes } from "@/lib/duration";


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
  serviceIds: Array<string | number>;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  staffId?: string;
  consultationStatus?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CheckoutRequest;

    const {
      serviceIds,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      staffId,
      consultationStatus,
    } = body;

    if (
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one treatment is required.",
        },
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

    const validConsultationStatuses = new Set([
      "online",
      "salon",
      "existing-unchanged",
      "update-required",
    ]);

    if (
      !consultationStatus ||
      !validConsultationStatuses.has(consultationStatus)
    ) {
      return NextResponse.json(
        {
          error:
            "A valid consultation status is required.",
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

    const normalizedServiceIds = Array.from(
      new Set(
        serviceIds
          .map((id) => String(id).trim())
          .filter(Boolean)
      )
    );

    if (normalizedServiceIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one valid treatment is required.",
        },
        { status: 400 }
      );
    }

    const services = await Promise.all(
      normalizedServiceIds.map(
        async (rawServiceId) => {
          const isNumericServiceId =
            /^\d+$/.test(rawServiceId);

          return isNumericServiceId
            ? await prisma.service.findUnique({
                where: {
                  serviceNo:
                    `SRV-${rawServiceId.padStart(
                      3,
                      "0"
                    )}`,
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
        }
      )
    );

    if (
      services.some(
        (service) =>
          !service || !service.active
      )
    ) {
      return NextResponse.json(
        {
          error:
            "One or more selected treatments are no longer available.",
        },
        { status: 400 }
      );
    }

    const selectedServices = services.filter(
      (
        service
      ): service is NonNullable<typeof service> =>
        Boolean(service)
    );

    const invalidPriceService =
      selectedServices.find(
        (service) => {
          const price =
            Number(service.price);

          return (
            !Number.isFinite(price) ||
            price <= 0
          );
        }
      );

    if (invalidPriceService) {
      return NextResponse.json(
        {
          error:
            "One or more selected treatments have an invalid price.",
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

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      selectedServices.map(
        (service) => ({
          price_data: {
            currency: "gbp",

            product_data: {
              name: service.name,
              description:
                `${service.duration} minute appointment at ORANE Ickenham`,
            },

            unit_amount:
              Math.round(
                Number(service.price) * 100
              ),
          },

          quantity: 1,
        })
      );

    const totalPrice =
      selectedServices.reduce(
        (total, service) =>
          total +
          Number(service.price),
        0
      );

    const totalDuration =
      selectedServices.reduce(
        (total, service) =>
          total +
          getDurationMinutes(service.duration),
        0
      );

    const serviceNames =
      selectedServices
        .map(
          (service) => service.name
        )
        .join(", ");

    const serviceCategories =
      Array.from(
        new Set(
          selectedServices
            .map(
              (service) =>
                service.category
            )
            .filter(Boolean)
        )
      ).join(", ");

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email:
          customerEmail,

        line_items:
          lineItems,

        metadata: {
          serviceIds:
            JSON.stringify(
              selectedServices.map(
                (service) =>
                  service.id
              )
            ),

          serviceNames,

          serviceBilling:
            JSON.stringify(
              selectedServices.map((service) => ({
                name: service.name,
                price: Number(service.price),
              }))
            ),

          customerName,

          customerEmail,

          customerPhone:
            customerPhone ?? "",

          consultationStatus:
            consultationStatus ??
            "existing-unchanged",

          category:
            serviceCategories,

          staffId:
            verifiedStaffId,

          appointmentDate,

          appointmentTime,

          duration:
            String(
              totalDuration
            ),

          price:
            totalPrice.toFixed(2),
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

