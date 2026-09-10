import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCustomerPrisma } from "@/lib/customerDb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    const confirmPassword = String(
      body.confirmPassword ?? ""
    );

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or missing password reset link." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const prisma = getCustomerPrisma();

    const resetToken =
      await prisma.customerPasswordResetToken.findUnique({
        where: {
          tokenHash,
        },
        include: {
          customer: true,
        },
      });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date() ||
      !resetToken.customer.passwordHash
    ) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    await prisma.$transaction([
      prisma.customer.update({
        where: {
          id: resetToken.customerId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.customerPasswordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),

      prisma.customerSession.updateMany({
        where: {
          customerId: resetToken.customerId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    console.error("Customer reset password error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to reset your password right now.",
      },
      { status: 500 }
    );
  }
}