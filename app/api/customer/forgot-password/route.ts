import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { getCustomerPrisma } from "@/lib/customerDb";
import { sendCustomerPasswordResetEmail } from "@/lib/customerMailer";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  const genericResponse = NextResponse.json({
    ok: true,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  });

  try {
    const body = await request.json();
    const email = clean(body.email);

    if (!email) {
      return genericResponse;
    }

    const prisma = getCustomerPrisma();

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer?.passwordHash) {
      return genericResponse;
    }

    await prisma.customerPasswordResetToken.deleteMany({
      where: {
        customerId: customer.id,
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.customerPasswordResetToken.create({
      data: {
        tokenHash,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const origin = new URL(request.url).origin;

    const resetUrl =
      `${origin}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendCustomerPasswordResetEmail(
      customer.email,
      resetUrl
    );

    return genericResponse;
  } catch (error) {
    console.error("Customer forgot password error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to process the password reset request right now.",
      },
      {
        status: 500,
      }
    );
  }
}