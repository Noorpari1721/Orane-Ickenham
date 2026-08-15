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

function serializeService(service: any) {
  return {
    id: service.id,
    serviceNo: service.serviceNo,
    name: service.name,
    category: service.category,
    duration: service.duration,
    price: Number(service.price),
    active: service.active,
  };
}

export async function GET() {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }
  try {
    const prisma = getPrisma();

    const services = await prisma.service.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      services: services.map(serializeService),
    });
  } catch (error) {
    console.error("GET /api/admin/services failed:", error);

    return NextResponse.json(
      { error: "Unable to load services." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const duration = Number(body.duration);
    const price = Number(body.price);

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than 0." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid amount." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const serviceCount = await prisma.service.count();

    const serviceNo = `SRV-${String(serviceCount + 1).padStart(3, "0")}`;

    const service = await prisma.service.create({
      data: {
        serviceNo,
        name,
        category,
        duration,
        price,
        active: true,
      },
    });

    return NextResponse.json(
      { service: serializeService(service) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/services failed:", error);

    return NextResponse.json(
      { error: "Unable to create service." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();

    const id = String(body.id ?? "");
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const duration = Number(body.duration);
    const price = Number(body.price);

    if (!id || !name || !category) {
      return NextResponse.json(
        { error: "Service ID, name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than 0." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid amount." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        category,
        duration,
        price,
      },
    });

    return NextResponse.json({
      service: serializeService(service),
    });
  } catch (error) {
    console.error("PUT /api/admin/services failed:", error);

    return NextResponse.json(
      { error: "Unable to update service." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();

    const id = String(body.id ?? "");
    const active = Boolean(body.active);

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const service = await prisma.service.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({
      service: serializeService(service),
    });
  } catch (error) {
    console.error("PATCH /api/admin/services failed:", error);

    return NextResponse.json(
      { error: "Unable to change service status." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
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
        { error: "Service ID is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/services failed:", error);

    return NextResponse.json(
      { error: "Unable to delete service." },
      { status: 500 }
    );
  }
}
