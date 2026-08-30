import { NextResponse } from "next/server";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const runtime = "nodejs";

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

type GiftCardCheckoutRequest = {
  giftType: "service" | "custom";
  serviceName?: string;
  serviceNames?: string[];
  serviceIds?: string[];
  amount?: number | string;

  purchaserFirstName?: string;
  purchaserLastName?: string;
  purchaserEmail?: string;

  recipientFirstName?: string;
  recipientLastName?: string;
  recipientEmail?: string;

  personalMessage?: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function generateGiftCardCode() {
  const bytes = randomBytes(9);

  const raw = bytes
    .toString("hex")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  return `ORANE-${raw.slice(0, 4)}-${raw.slice(
    4,
    8
  )}-${raw.slice(8, 12)}`;
}

function generateGiftCardNumber() {
  const bytes = randomBytes(6);

  return `GC-${bytes.toString("hex").toUpperCase()}`;
}

function addTwoYears(date: Date) {
  const expires = new Date(date);

  expires.setFullYear(expires.getFullYear() + 2);

  return expires;
}

export async function POST(request: Request) {
  let createdGiftCardId: string | null = null;

  try {
    const body =
      (await request.json()) as GiftCardCheckoutRequest;

    const giftType = body.giftType;

    if (
      giftType !== "service" &&
      giftType !== "custom"
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid Gift Card type.",
        },
        { status: 400 }
      );
    }

    const serviceName = cleanString(
      body.serviceName
    );

    const serviceIds = Array.isArray(body.serviceIds)
      ? [
          ...new Set(
            body.serviceIds
              .map((id) => cleanString(id))
              .filter(Boolean)
          ),
        ]
      : [];

    const serviceNames = Array.isArray(body.serviceNames)
      ? body.serviceNames
          .map((name) => cleanString(name))
          .filter(Boolean)
      : [];

    const purchaserFirstName = cleanString(
      body.purchaserFirstName
    );

    const purchaserLastName = cleanString(
      body.purchaserLastName
    );

    const purchaserEmail = cleanString(
      body.purchaserEmail
    ).toLowerCase();

    const recipientFirstName = cleanString(
      body.recipientFirstName
    );

    const recipientLastName = cleanString(
      body.recipientLastName
    );

    const recipientEmail = cleanString(
      body.recipientEmail
    ).toLowerCase();

    const personalMessage = cleanString(
      body.personalMessage
    );

    if (!recipientEmail && !purchaserEmail) {
      return NextResponse.json(
        {
          error:
            "A valid email address is required for Gift Card delivery.",
        },
        { status: 400 }
      );
    }

    if (
      purchaserEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        purchaserEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid purchaser email address.",
        },
        { status: 400 }
      );
    }

    if (
      recipientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        recipientEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid recipient email address.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    let finalAmount = 0;

    let services: Array<{
      id: string;
      name: string;
      price: number;
      active: boolean;
    }> = [];
    let linkedServiceId: string | null = null;
    let productName = "ORANE Gift Card";
    let productDescription =
      "Luxury Gift Card for ORANE Ickenham";

    if (giftType === "service") {

      if (
        serviceIds.length === 0 &&
        !serviceName
      ) {
        return NextResponse.json(
          {
            error:
              "Please select at least one service Gift Voucher.",
          },
          { status: 400 }
        );
      }

      if (serviceIds.length > 0) {

        const foundServices =
          await prisma.service.findMany({
            where: {
              id: {
                in: serviceIds,
              },
              active: true,
            },
            select: {
              id: true,
              name: true,
              price: true,
              active: true,
            },
          });

        if (
          foundServices.length !==
          serviceIds.length
        ) {
          return NextResponse.json(
            {
              error:
                "One or more selected services are no longer available.",
            },
            { status: 400 }
          );
        }

        const serviceMap = new Map(
          foundServices.map(
            (service) => [
              service.id,
              service,
            ]
          )
        );

        services = serviceIds.map(
          (id) => {
            const service =
              serviceMap.get(id);

            if (!service) {
              throw new Error(
                "Selected service could not be resolved."
              );
            }

            return {
              id: service.id,
              name: service.name,
              price: Number(service.price),
              active: service.active,
            };
          }
        );

      } else {

        const fallbackService =
          await prisma.service.findFirst({
            where: {
              name: serviceName,
              active: true,
            },
            select: {
              id: true,
              name: true,
              price: true,
              active: true,
            },
          });

        if (
          !fallbackService ||
          !fallbackService.active
        ) {
          return NextResponse.json(
            {
              error:
                "The selected service is no longer available.",
            },
            { status: 400 }
          );
        }

        services = [
          {
            id: fallbackService.id,
            name: fallbackService.name,
            price: Number(
              fallbackService.price
            ),
            active:
              fallbackService.active,
          },
        ];
      }

      if (services.length === 0) {
        return NextResponse.json(
          {
            error:
              "No valid services were selected.",
          },
          { status: 400 }
        );
      }

      finalAmount =
        services.reduce(
          (
            total,
            service
          ) =>
            total +
            service.price,
          0
        );

      linkedServiceId =
        services[0]?.id ?? null;

      const serviceDisplayNames =
        services
          .map(
            (service) =>
              service.name
          )
          .join(", ");

      productName =
        services.length === 1
          ? `${services[0].name} — ORANE Gift Voucher`
          : `ORANE Gift Voucher — ${services.length} Treatments`;

      productDescription =
        `Gift voucher for ${serviceDisplayNames} at ORANE Ickenham`;

    } else {
      const numericAmount =
        typeof body.amount === "string"
          ? Number(body.amount)
          : Number(body.amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount < 25 ||
        numericAmount > 500
      ) {
        return NextResponse.json(
          {
            error:
              "Custom Gift Cards must be between £25 and £500.",
          },
          { status: 400 }
        );
      }

      finalAmount =
        Math.round(numericAmount * 100) / 100;

      productName = "ORANE Custom Gift Card";
      productDescription =
        "Flexible Gift Card for ORANE Ickenham";
    }

    if (
      !Number.isFinite(finalAmount) ||
      finalAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The Gift Card amount is invalid.",
        },
        { status: 400 }
      );
    }

    const issuedDate = new Date();
    const expiresAt = addTwoYears(issuedDate);

    let giftCardNo = generateGiftCardNumber();
    let code = generateGiftCardCode();

    let existingGiftCard =
      await prisma.giftCard.findFirst({
        where: {
          OR: [
            { giftCardNo },
            { code },
          ],
        },
        select: {
          id: true,
        },
      });

    while (existingGiftCard) {
      giftCardNo = generateGiftCardNumber();
      code = generateGiftCardCode();

      existingGiftCard =
        await prisma.giftCard.findFirst({
          where: {
            OR: [
              { giftCardNo },
              { code },
            ],
          },
          select: {
            id: true,
          },
        });
    }

    const giftCard =
      await prisma.giftCard.create({
        data: {
          giftCardNo,
          code,

          type:
            giftType === "service"
              ? "SERVICE_VOUCHER"
              : "CUSTOM_GIFT_CARD",

          status: "PENDING",

          amount: finalAmount,
          remainingAmount: finalAmount,

          serviceId: linkedServiceId,

          purchaserFirstName:
            purchaserFirstName || null,
          purchaserLastName:
            purchaserLastName || null,
          purchaserEmail:
            purchaserEmail || null,

          recipientFirstName:
            recipientFirstName || null,
          recipientLastName:
            recipientLastName || null,
          recipientEmail:
            recipientEmail || null,

          personalMessage:
            personalMessage || null,

          expiresAt,
        },
      });

    createdGiftCardId = giftCard.id;
    if (
      giftType === "service" &&
      services.length > 0
    ) {

      await prisma.giftCardService.createMany({
        data: services.map(
          (service) => ({
            giftCardId:
              giftCard.id,
            serviceId:
              service.id,
          })
        ),
        skipDuplicates: true,
      });
    }

    const customerEmail =
      recipientEmail ||
      purchaserEmail;

    const origin =
      new URL(request.url).origin;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email:
          customerEmail || undefined,

        line_items: [
          {
            price_data: {
              currency: "gbp",

              product_data: {
                name: productName,
                description:
                  productDescription,
              },

              unit_amount:
                Math.round(
                  finalAmount * 100
                ),
            },

            quantity: 1,
          },
        ],

        metadata: {
          paymentType: "gift_card",
          giftCardId: giftCard.id,
          giftCardNo: giftCard.giftCardNo,
          giftCardCode: giftCard.code,

          giftCardType:
            giftType === "service"
              ? "SERVICE_VOUCHER"
              : "CUSTOM_GIFT_CARD",

          serviceId:
            linkedServiceId || "",

          serviceName:
            serviceName || "",

          amount:
            finalAmount.toFixed(2),

          purchaserFirstName:
            purchaserFirstName || "",

          purchaserLastName:
            purchaserLastName || "",

          purchaserEmail:
            purchaserEmail || "",

          recipientFirstName:
            recipientFirstName || "",

          recipientLastName:
            recipientLastName || "",

          recipientEmail:
            recipientEmail || "",
        },

        success_url:
          `${origin}/success?gift_card=success&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/gift-cards`,
      });

    if (!session.url) {
      await prisma.giftCard.delete({
        where: {
          id: giftCard.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "Stripe Checkout URL was not created.",
        },
        { status: 500 }
      );
    }

    await prisma.giftCard.update({
      where: {
        id: giftCard.id,
      },
      data: {
        stripeSessionId: session.id,
      },
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Gift Card Stripe Checkout error:",
      error
    );

    if (createdGiftCardId) {
      try {
        const prisma = getPrisma();

        await prisma.giftCard.delete({
          where: {
            id: createdGiftCardId,
          },
        });
      } catch (cleanupError) {
        console.error(
          "Gift Card cleanup failed:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to create Gift Card Checkout session.",
      },
      { status: 500 }
    );
  }
}
