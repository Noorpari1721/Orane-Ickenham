import { NextResponse } from "next/server";

import { getCustomerSession } from "@/lib/customerAuth";

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: session.customer.id,
        firstName: session.customer.firstName,
        lastName: session.customer.lastName,
        email: session.customer.email,
        phone: session.customer.phone,
        dateOfBirth: session.customer.dateOfBirth,
      },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}