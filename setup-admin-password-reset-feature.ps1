$ErrorActionPreference = "Stop"

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = ".\admin-reset-backups\feature-$stamp"

$files = @(
    "app\admin-login\page.tsx",
    "app\api\admin\login\route.ts",
    "app\api\admin\forgot-password\route.ts",
    "app\api\admin\reset-password\route.ts"
)

$backups = @{}
$createdFiles = @()

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }

    [System.IO.File]::WriteAllText(
        (Join-Path (Get-Location) $Path),
        $Content,
        (New-Object System.Text.UTF8Encoding($false))
    )
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

try {

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "ADMIN PASSWORD RESET FEATURE SETUP" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    foreach ($file in $files) {
        if (Test-Path -LiteralPath $file) {
            $safeName = $file -replace '[\\/]', '__'
            $backup = Join-Path $backupDir $safeName

            Copy-Item -LiteralPath $file -Destination $backup -Force

            $backups[$file] = $backup
        }
        else {
            $createdFiles += $file
        }
    }

    Write-Host "Backup created: $backupDir" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "CHECKING BCRYPTJS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npm install bcryptjs

    if ($LASTEXITCODE -ne 0) {
        throw "bcryptjs installation failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "WRITING LOGIN ROUTE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    Write-Utf8NoBom "app\api\admin\login\route.ts" @'
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_COOKIE, createAdminSession } from "@/lib/adminAuth";

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

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    let admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      const configuredEmail = String(
        process.env.ADMIN_EMAIL ?? ""
      )
        .trim()
        .toLowerCase();

      const configuredPassword = String(
        process.env.ADMIN_PASSWORD ?? ""
      );

      if (
        email === configuredEmail &&
        configuredPassword &&
        password === configuredPassword
      ) {
        admin = await prisma.admin.create({
          data: {
            email,
            passwordHash: await bcrypt.hash(password, 12),
          },
        });
      } else {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }
    } else {
      const passwordValid = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      if (!passwordValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    const session = createAdminSession(admin.email);

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
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 500 }
    );
  }
}
'@

    Write-Host "LOGIN ROUTE WRITTEN" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "WRITING FORGOT PASSWORD ROUTE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    Write-Utf8NoBom "app\api\admin\forgot-password\route.ts" @'
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

function getTransporter() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT || "587");
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Brevo SMTP configuration is incomplete.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
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

    const successResponse = NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });

    if (!admin) {
      return successResponse;
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        adminId: admin.id,
        usedAt: null,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt,
        adminId: admin.id,
      },
    });

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${origin}/admin-login?reset=${encodeURIComponent(token)}`;

    const transporter = getTransporter();

    const fromEmail =
      process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER;

    await transporter.sendMail({
      from: fromEmail,
      to: admin.email,
      subject: "Reset your Orane Ickenham admin password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#111;color:#fff">
          <h2 style="color:#D4AF37">Orane Ickenham</h2>
          <p>You requested a password reset for your admin account.</p>
          <p>This link will expire in 1 hour.</p>
          <p style="margin:30px 0">
            <a
              href="${resetUrl}"
              style="display:inline-block;padding:14px 22px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:bold"
            >
              Reset Password
            </a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}
'@

    Write-Host "FORGOT PASSWORD ROUTE WRITTEN" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "WRITING RESET PASSWORD ROUTE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    Write-Utf8NoBom "app\api\admin\reset-password\route.ts" @'
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
        { error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
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
        include: {
          admin: true,
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
            "This password reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

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
      prisma.passwordResetToken.deleteMany({
        where: {
          adminId: resetToken.adminId,
          id: {
            not: resetToken.id,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { error: "Unable to reset password." },
      { status: 500 }
    );
  }
}
'@

    Write-Host "RESET PASSWORD ROUTE WRITTEN" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "WRITING ADMIN LOGIN PAGE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    Write-Utf8NoBom "app\admin-login\page.tsx" @'
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  LockKeyhole,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "forgot" | "reset";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resetToken = searchParams.get("reset");

  const [mode, setMode] = useState<Mode>(
    resetToken ? "reset" : "login"
  );

  const [email, setEmail] = useState(
    "oraneickenham@gmail.com"
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (resetToken) {
      setMode("reset");
      setError("");
      setMessage("");
    }
  }, [resetToken]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to sign in."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to request password reset."
        );
      }

      setMessage(
        data.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request password reset."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!resetToken) {
      setError("Invalid password reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: resetToken,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to reset password."
        );
      }

      setMessage(
        "Password reset successfully. You can now sign in."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/admin-login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "login"
      ? "Admin Login"
      : mode === "forgot"
      ? "Reset Password"
      : "Choose New Password";

  const subtitle =
    mode === "login"
      ? "Secure management portal"
      : mode === "forgot"
      ? "Enter your admin email to receive a reset link"
      : "Create a new password for your admin account";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
            Orane Ickenham
          </p>

          <h1 className="mt-3 text-3xl font-light">
            {title}
          </h1>

          <p className="mt-2 text-sm text-white/40">
            {subtitle}
          </p>
        </div>

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "forgot"
              ? handleForgotPassword
              : handleResetPassword
          }
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {mode !== "reset" && (
            <div className="mb-5">
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Admin Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="mb-5">
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                {mode === "reset"
                  ? "New Password"
                  : "Password"}
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={
                    mode === "reset"
                      ? "Minimum 8 characters"
                      : "Enter admin password"
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                />
              </div>
            </div>
          )}

          {mode === "reset" && (
            <div className="mb-6">
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Confirm Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-medium text-black transition hover:bg-[#e1c45b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Please wait...
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : mode === "forgot" ? (
              "Send Reset Link"
            ) : (
              "Reset Password"
            )}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => changeMode("forgot")}
              className="mt-5 w-full text-center text-sm text-[#D4AF37] transition hover:text-[#e1c45b]"
            >
              Forgot password?
            </button>
          )}

          {mode !== "login" && !resetToken && (
            <button
              type="button"
              onClick={() => changeMode("login")}
              className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to login
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
'@

    Write-Host "ADMIN LOGIN PAGE WRITTEN" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "GENERATING PRISMA CLIENT" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npx prisma generate

    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "TYPESCRIPT CHECK" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npx tsc --noEmit --pretty false

    if ($LASTEXITCODE -ne 0) {
        throw "TypeScript check failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PRODUCTION BUILD" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npm run build

    if ($LASTEXITCODE -ne 0) {
        throw "Production build failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "ADMIN PASSWORD RESET FEATURE PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "TypeScript: PASSED" -ForegroundColor Green
    Write-Host "Build: PASSED" -ForegroundColor Green
    Write-Host "Backup: $backupDir" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
}
catch {

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "FAILED - AUTOMATIC ROLLBACK" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red

    Write-Host $_.Exception.Message -ForegroundColor Yellow

    foreach ($item in $backups.GetEnumerator()) {
        Copy-Item `
            -LiteralPath $item.Value `
            -Destination $item.Key `
            -Force
    }

    foreach ($file in $createdFiles) {
        if (Test-Path -LiteralPath $file) {
            Remove-Item -LiteralPath $file -Force
        }
    }

    Write-Host ""
    Write-Host "Original files restored." -ForegroundColor Yellow

    exit 1
}