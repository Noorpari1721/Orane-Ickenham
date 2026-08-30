import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as {
  giftCardPrisma?: PrismaClient;
};

function getPrisma() {
  if (globalForPrisma.giftCardPrisma) {
    return globalForPrisma.giftCardPrisma;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  globalForPrisma.giftCardPrisma = prisma;

  return prisma;
}

export async function GET() {
  try {
    const prisma = getPrisma();

    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          price: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        serviceNo: true,
        name: true,
        category: true,
        description: true,
        duration: true,
        price: true,
        active: true,
      },
    });

    const normalizedServices = services.map((service) => ({
      id: service.id,
      serviceNo: service.serviceNo,
      name: service.name,
      category: service.category?.trim() || "Other",
      description: service.description ?? "",
      duration: service.duration,
      price: Number(service.price),
      active: service.active,
    }));

    const categoryMap = new Map<
      string,
      typeof normalizedServices
    >();

    for (const service of normalizedServices) {
      const category = service.category || "Other";

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }

      categoryMap.get(category)!.push(service);
    }

    const categoryServices = Array.from(categoryMap.entries())
      .map(([category, categoryItems]) => ({
        category,
        services: [...categoryItems].sort(
          (a, b) =>
            a.price - b.price ||
            a.name.localeCompare(b.name)
        ),
      }))
      .sort(
        (a, b) =>
          (a.services[0]?.price ?? 0) -
            (b.services[0]?.price ?? 0) ||
          a.category.localeCompare(b.category)
      );

    const serviceCategories = categoryServices.map(
      ({ category, services: categoryItems }) => ({
        category,
        title: category,
        services: categoryItems,
      })
    );

    return NextResponse.json(
      {
        services: normalizedServices,

        categories: serviceCategories.map(
          (item) => item.category
        ),

        serviceCategories,

        categoryServices,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/gift-cards/services failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load treatments.",
      },
      {
        status: 500,
      }
    );
  }
}