import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCustomerPrisma } from "@/lib/customerDb";
import { createCustomerSession } from "@/lib/customerAuth";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
  const dateOfBirth = clean(body.dateOfBirth);
    const password = String(body.password ?? "");

    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !password) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const prisma = getCustomerPrisma();

    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing?.passwordHash) {
      return NextResponse.json(
        { error: "An account already exists for this email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: {
            firstName,
            lastName,
            phone: phone || null,
      dateOfBirth,
            passwordHash,
          },
        })
      : await prisma.customer.create({
          data: {
            customerNo: `CUST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            firstName,
            lastName,
            email,
            phone: phone || null,
      dateOfBirth,
            passwordHash,
          },
        });

    await createCustomerSession(customer.id);

    return NextResponse.json({
      ok: true,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create the account right now." },
      { status: 500 }
    );
  }
}