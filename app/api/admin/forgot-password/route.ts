import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    const successMessage =
      "If that email exists, a password reset link has been sent.";

    if (!admin) {
      return NextResponse.json({
        success: true,
        message: successMessage,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.passwordResetToken.deleteMany({
      where: {
        adminId: admin.id,
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt: new Date(
          Date.now() + 60 * 60 * 1000
        ),
        adminId: admin.id,
      },
    });

    const host = request.headers.get("host");

    const protocol =
      process.env.NODE_ENV === "production"
        ? "https"
        : "http";

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${protocol}://${host}`;

    const resetUrl =
      `${baseUrl}/admin-login?resetToken=${rawToken}`;

    const smtpHost = process.env.BREVO_SMTP_HOST;
    const smtpPort = Number(
      process.env.BREVO_SMTP_PORT || "587"
    );
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;
    const fromEmail = process.env.BREVO_FROM_EMAIL;

    if (
      !smtpHost ||
      !smtpUser ||
      !smtpPass ||
      !fromEmail
    ) {
      throw new Error(
        "Email configuration is incomplete."
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: admin.email,
      subject: "Reset your Orane Ickenham admin password",
      text:
        "You requested a password reset.\n\n" +
        `Reset your password here:\n${resetUrl}\n\n` +
        "This link expires in 1 hour.",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;background:#111;color:#fff">
          <h2 style="color:#D4AF37">
            Orane Ickenham
          </h2>
          <h3>Reset your admin password</h3>
          <p>You requested a password reset.</p>
          <p>
            <a
              href="${resetUrl}"
              style="display:inline-block;padding:12px 20px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px"
            >
              Reset Password
            </a>
          </p>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: successMessage,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process password reset." },
      { status: 500 }
    );
  }
}
