"use client";

import {
  FormEvent,
  useState,
  Suspense,
} from "react";

import {
  LockKeyhole,
  Loader2,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") ?? "";

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/admin/reset-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              token,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to reset password."
        );
      }

      router.replace(
        "/admin-login"
      );
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

  if (!token) {
    return (
      <div className="text-center text-red-300">
        Invalid password reset link.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]">
          Orane Ickenham
        </p>

        <h1 className="mt-3 text-3xl font-light">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-white/40">
          Create your new admin password
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-5">
        <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
          New Password
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
              setPassword(
                event.target.value
              )
            }
            placeholder="Minimum 8 characters"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

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
            placeholder="Repeat new password"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

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
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
      <Suspense
        fallback={
          <div className="text-white/50">
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
