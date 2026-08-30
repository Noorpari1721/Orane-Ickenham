import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured."
    );
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

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const email =
      String(
        searchParams.get("email") ?? ""
      )
        .trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          exists: false,
        }
      );
    }

    const prisma = getPrisma();

    const customer =
      await prisma.customer.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

    if (!customer) {
      return NextResponse.json({
        exists: false,
      });
    }

    return NextResponse.json({
      exists: true,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone ?? "",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/booking/customer-check failed:",
      error
    );

    return NextResponse.json(
      {
        exists: false,
        error:
          "Unable to check customer at this time.",
      },
      {
        status: 500,
      }
    );
  }
}