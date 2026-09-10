import { NextResponse } from "next/server";

import { clearCustomerSession } from "@/lib/customerAuth";

export async function POST() {
  try {
    await clearCustomerSession();

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to sign out right now." },
      { status: 500 }
    );
  }
}