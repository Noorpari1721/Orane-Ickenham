import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const runtime = "nodejs";

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

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Invalid password reset request." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const prisma = getPrisma();

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or expired.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    await prisma.$transaction([
      prisma.admin.update({
        where: {
          id: resetToken.adminId,
        },
        data: {
          passwordHash,
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully. You can now sign in.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reset password." },
      { status: 500 }
    );
  }
}
