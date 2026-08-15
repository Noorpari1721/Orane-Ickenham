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

function serializeCustomer(customer: any) {
  const bookings = customer.bookings ?? [];
  const payments = customer.payments ?? [];

  const paidPayments = payments.filter(
    (payment: any) => payment.status === "PAID"
  );

  const spent = paidPayments.reduce(
    (total: number, payment: any) =>
      total + Number(payment.amount),
    0
  );

  const sortedBookings = [...bookings].sort(
    (a: any, b: any) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  const latestBooking = sortedBookings[0];

  const serviceCounts = new Map<string, number>();

  for (const booking of bookings) {
    const serviceName = booking.service?.name;

    if (serviceName) {
      serviceCounts.set(
        serviceName,
        (serviceCounts.get(serviceName) ?? 0) + 1
      );
    }
  }

  let favourite = "No bookings yet";
  let highestCount = 0;

  for (const [serviceName, count] of serviceCounts) {
    if (count > highestCount) {
      highestCount = count;
      favourite = serviceName;
    }
  }

  return {
    id: customer.id,
    customerNo: customer.customerNo,
    firstName: customer.firstName,
    lastName: customer.lastName,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    notes: customer.notes,
    visits: bookings.length,
    spent,
    lastVisit: latestBooking?.date ?? null,
    favourite,
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const prisma = getPrisma();

    const customers = await prisma.customer.findMany({
      include: {
        bookings: {
          include: {
            service: true,
          },
          orderBy: {
            date: "desc",
          },
        },
        payments: true,
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    return NextResponse.json({
      customers: customers.map(serializeCustomer),
    });
  } catch (error) {
    console.error("GET /api/admin/customers failed:", error);

    return NextResponse.json(
      { error: "Unable to load customers." },
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

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim() || null;
    const notes = String(body.notes ?? "").trim() || null;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            "First name, last name and email are required.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this email already exists." },
        { status: 409 }
      );
    }

    const customerCount = await prisma.customer.count();

    const customerNo = `CUS-${String(
      customerCount + 1
    ).padStart(3, "0")}`;

    const customer = await prisma.customer.create({
      data: {
        customerNo,
        firstName,
        lastName,
        email,
        phone,
        notes,
        status: "ACTIVE",
      },
      include: {
        bookings: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(
      {
        customer: serializeCustomer(customer),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/customers failed:", error);

    return NextResponse.json(
      { error: "Unable to create customer." },
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
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim() || null;
    const notes = String(body.notes ?? "").trim() || null;

    if (!id || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            "Customer ID, first name, last name and email are required.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const duplicate = await prisma.customer.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another customer already uses this email." },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        notes,
      },
      include: {
        bookings: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      customer: serializeCustomer(customer),
    });
  } catch (error) {
    console.error("PUT /api/admin/customers failed:", error);

    return NextResponse.json(
      { error: "Unable to update customer." },
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

    const status =
      body.status === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const customer = await prisma.customer.update({
      where: { id },
      data: { status },
      include: {
        bookings: {
          include: {
            service: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      customer: serializeCustomer(customer),
    });
  } catch (error) {
    console.error("PATCH /api/admin/customers failed:", error);

    return NextResponse.json(
      { error: "Unable to change customer status." },
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
        { error: "Customer ID is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const bookingCount = await prisma.booking.count({
      where: {
        customerId: id,
      },
    });

    const paymentCount = await prisma.payment.count({
      where: {
        customerId: id,
      },
    });

    if (bookingCount > 0 || paymentCount > 0) {
      return NextResponse.json(
        {
          error:
            "This customer has booking or payment history and cannot be deleted. Set the customer to Inactive instead.",
        },
        { status: 409 }
      );
    }

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/customers failed:", error);

    return NextResponse.json(
      { error: "Unable to delete customer." },
      { status: 500 }
    );
  }
}
