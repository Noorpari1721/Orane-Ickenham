import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/adminAuth";
import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
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

function serializeTech(tech: Prisma.TechModel) {
  return {
    id: tech.id,
    techNo: tech.techNo,
    firstName: tech.firstName,
    lastName: tech.lastName,
    email: tech.email,
    phone: tech.phone,
    role: tech.role,
    experience: tech.experience,
    specialties: tech.specialties,
    status: tech.status,
  };
}

async function requireAdmin() {
  const cookieStore = await cookies();

  return verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE)?.value
  );
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const prisma = getPrisma();

    const techs = await prisma.tech.findMany({
      orderBy: {
        techNo: "asc",
      },
    });

    return NextResponse.json({
      techs: techs.map(serializeTech),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load technicians.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const firstName = String(
      body.firstName ?? ""
    ).trim();

    const lastName = String(
      body.lastName ?? ""
    ).trim();

    const email =
      String(body.email ?? "").trim() ||
      null;

    const phone =
      String(body.phone ?? "").trim() ||
      null;

    const role =
      String(body.role ?? "").trim() ||
      null;

    const experience = Number(
      body.experience ?? 0
    );

    const specialties =
      Array.isArray(body.specialties)
        ? body.specialties
            .map((item: unknown) =>
              String(item).trim()
            )
            .filter(Boolean)
        : [];

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          error:
            "First name and last name are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(experience) ||
      experience < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Experience must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    const prisma = getPrisma();

    const existingTechs =
      await prisma.tech.findMany({
        select: {
          techNo: true,
        },
      });

    let highestNumber = 0;

    for (const tech of existingTechs) {
      const match =
        tech.techNo.match(/(\d+)$/);

      if (match) {
        const number = Number(match[1]);

        if (
          Number.isFinite(number) &&
          number > highestNumber
        ) {
          highestNumber = number;
        }
      }
    }

    const nextNumber =
      highestNumber + 1;

    const techNo =
      `TECH-${String(nextNumber).padStart(3, "0")}`;

    const tech =
      await prisma.tech.create({
        data: {
          techNo,
          firstName,
          lastName,
          email,
          phone,
          role,
          experience,
          specialties,
          status: "AVAILABLE",
        },
      });

    return NextResponse.json(
      {
        tech: serializeTech(tech),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create technician.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const id = String(
      body.id ?? ""
    );

    const firstName = String(
      body.firstName ?? ""
    ).trim();

    const lastName = String(
      body.lastName ?? ""
    ).trim();

    const email =
      String(body.email ?? "").trim() ||
      null;

    const phone =
      String(body.phone ?? "").trim() ||
      null;

    const role =
      String(body.role ?? "").trim() ||
      null;

    const experience = Number(
      body.experience ?? 0
    );

    const specialties =
      Array.isArray(body.specialties)
        ? body.specialties
            .map((item: unknown) =>
              String(item).trim()
            )
            .filter(Boolean)
        : [];

    if (
      !id ||
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          error:
            "Technician ID, first name and last name are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(experience) ||
      experience < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Experience must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    const prisma = getPrisma();

    const tech =
      await prisma.tech.update({
        where: {
          id,
        },
        data: {
          firstName,
          lastName,
          email,
          phone,
          role,
          experience,
          specialties,
        },
      });

    return NextResponse.json({
      tech: serializeTech(tech),
    });
  } catch (error) {
    console.error(
      "PUT /api/admin/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update technician.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const id = String(
      body.id ?? ""
    );

    const status =
      body.status === "UNAVAILABLE"
        ? "UNAVAILABLE"
        : "AVAILABLE";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Technician ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const prisma = getPrisma();

    const tech =
      await prisma.tech.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

    return NextResponse.json({
      tech: serializeTech(tech),
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to change technician status.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const id = String(
      body.id ?? ""
    );

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Technician ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const prisma = getPrisma();

    const bookingCount =
      await prisma.booking.count({
        where: {
          techId: id,
        },
      });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error:
            "This technician has bookings and cannot be deleted. Set them to Unavailable instead.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.tech.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/techs failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete technician.",
      },
      {
        status: 500,
      }
    );
  }
}
