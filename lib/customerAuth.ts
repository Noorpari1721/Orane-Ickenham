import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { getCustomerPrisma } from "@/lib/customerDb";

const COOKIE_NAME = "orane_customer_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createCustomerSession(customerId: string) {
  const prisma = getCustomerPrisma();

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.customerSession.create({
    data: {
      tokenHash,
      customerId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return expiresAt;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const prisma = getCustomerPrisma();
  const tokenHash = hashToken(token);

  const session = await prisma.customerSession.findUnique({
    where: {
      tokenHash,
    },
    include: {
      customer: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  return session;
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const prisma = getCustomerPrisma();

    await prisma.customerSession.updateMany({
      where: {
        tokenHash: hashToken(token),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function verifyCustomerPassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}