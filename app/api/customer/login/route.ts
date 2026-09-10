import { NextResponse } from "next/server";

import { getCustomerPrisma } from "@/lib/customerDb";
import {
  createCustomerSession,
  verifyCustomerPassword,
} from "@/lib/customerAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const prisma = getCustomerPrisma();

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer?.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await verifyCustomerPassword(
      password,
      customer.passwordHash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createCustomerSession(customer.id);

    return NextResponse.json({
      ok: true,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}