import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";
import {
  PrismaClient,
  Prisma,
} from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

async function requireAdmin() {
  const cookieStore = await cookies();

  return verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE)?.value
  );
}

function serializeGiftCard(card: any) {
  return {
    id: card.id,
    giftCardNo: card.giftCardNo,
    code: card.code,
    type: card.type,
    status: card.status,
    amount: Number(card.amount),
    remainingAmount: Number(card.remainingAmount),
    service: card.service
      ? {
          id: card.service.id,
          name: card.service.name,
          category: card.service.category,
        }
      : null,
    purchaser: {
      firstName: card.purchaserFirstName,
      lastName: card.purchaserLastName,
      email: card.purchaserEmail,
    },
    recipient: {
      firstName: card.recipientFirstName,
      lastName: card.recipientLastName,
      email: card.recipientEmail,
    },
    personalMessage: card.personalMessage,
    issuedAt: card.issuedAt,
    paidAt: card.paidAt,
    expiresAt: card.expiresAt,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    redemptions: (card.redemptions ?? []).map(
      (redemption: any) => ({
        id: redemption.id,
        redemptionNo: redemption.redemptionNo,
        amount: Number(redemption.amount),
        redeemedAt: redemption.redeemedAt,
        notes: redemption.notes,
      })
    ),
  };
}

function makeRedemptionNo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `GCR-${timestamp}-${random}`;
}

export async function GET(request: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const prisma = getPrisma();
    const url = new URL(request.url);

    const search = (
      url.searchParams.get("search") ?? ""
    ).trim();

    const status = (
      url.searchParams.get("status") ?? ""
    ).trim();

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          giftCardNo: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          purchaserEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          recipientEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          purchaserFirstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          purchaserLastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          recipientFirstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          recipientLastName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const cards = await prisma.giftCard.findMany({
      where,
      include: {
        service: true,
        redemptions: {
          orderBy: {
            redeemedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      giftCards: cards.map(serializeGiftCard),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/gift-cards failed:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load gift cards." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const giftCardId = String(
      body.giftCardId ?? ""
    ).trim();

    const amount = Number(body.amount);

    const notes = String(
      body.notes ?? ""
    ).trim();

    if (!giftCardId) {
      return NextResponse.json(
        { error: "Gift Card ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Redemption amount must be greater than £0." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const result = await prisma.$transaction(
      async (tx) => {
        const card = await tx.giftCard.findUnique({
          where: {
            id: giftCardId,
          },
        });

        if (!card) {
          throw new Error(
            "Gift Card was not found."
          );
        }

        const now = new Date();

        if (card.expiresAt <= now) {
          if (
            card.status !== "EXPIRED" &&
            card.status !== "REDEEMED"
          ) {
            await tx.giftCard.update({
              where: {
                id: card.id,
              },
              data: {
                status: "EXPIRED",
              },
            });
          }

          throw new Error(
            "This Gift Card has expired."
          );
        }

        if (
          card.status === "PENDING"
        ) {
          throw new Error(
            "This Gift Card has not been activated."
          );
        }

        if (
          card.status === "CANCELLED"
        ) {
          throw new Error(
            "This Gift Card has been cancelled."
          );
        }

        if (
          card.status === "REDEEMED" ||
          Number(card.remainingAmount) <= 0
        ) {
          throw new Error(
            "This Gift Card has no remaining balance."
          );
        }

        const remaining =
          Number(card.remainingAmount);

        if (amount > remaining + 0.0001) {
          throw new Error(
            `Maximum redeemable amount is £${remaining.toFixed(2)}.`
          );
        }

        const newRemaining =
          Number(
            (
              remaining - amount
            ).toFixed(2)
          );

        const newStatus =
          newRemaining <= 0.0001
            ? "REDEEMED"
            : "PARTIALLY_REDEEMED";

        const updatedCard =
          await tx.giftCard.update({
            where: {
              id: card.id,
            },
            data: {
              remainingAmount:
                new Prisma.Decimal(
                  newRemaining.toFixed(2)
                ),
              status: newStatus,
            },
          });

        const redemption =
          await tx.giftCardRedemption.create({
            data: {
              redemptionNo:
                makeRedemptionNo(),
              giftCardId: card.id,
              amount:
                new Prisma.Decimal(
                  amount.toFixed(2)
                ),
              notes:
                notes || null,
            },
          });

        return {
          card: updatedCard,
          redemption,
        };
      }
    );

    return NextResponse.json({
      success: true,
      giftCard: {
        id: result.card.id,
        giftCardNo: result.card.giftCardNo,
        status: result.card.status,
        remainingAmount:
          Number(result.card.remainingAmount),
      },
      redemption: {
        redemptionNo:
          result.redemption.redemptionNo,
        amount:
          Number(result.redemption.amount),
        redeemedAt:
          result.redemption.redeemedAt,
        notes:
          result.redemption.notes,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to redeem Gift Card.";

    console.error(
      "POST /api/admin/gift-cards failed:",
      error
    );

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}