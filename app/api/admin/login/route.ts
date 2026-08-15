import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const adminEmail = String(
      process.env.ADMIN_EMAIL ?? ""
    ).trim().toLowerCase();

    const adminPassword = String(
      process.env.ADMIN_PASSWORD ?? ""
    );

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Admin authentication is not configured." },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const session = createAdminSession(adminEmail);

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: ADMIN_COOKIE,
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 500 }
    );
  }
}
