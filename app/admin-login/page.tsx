"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import {
  LockKeyhole,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "forgot" | "reset";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("resetToken");

  const [mode, setMode] = useState<Mode>(
    token ? "reset" : "login"
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
    if (token) {
      setMode("reset");
    }
  }, [token]);

  function clearMessages() {
    setError("");
    setMessage("");
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      clearMessages();

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

  async function handleForgot(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      clearMessages();

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
          "If that email exists, a reset link has been sent."
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

  async function handleReset(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      clearMessages();

      const response = await fetch(
        "/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
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
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      window.history.replaceState(
        {},
        "",
        "/admin-login"
      );

      setTimeout(() => {
        setMode("login");
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
        : "Enter your new secure password";

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
                ? handleForgot
                : handleReset
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
            <>
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
                    minLength={8}
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder={
                      mode === "reset"
                        ? "At least 8 characters"
                        : "Enter admin password"
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                  />
                </div>
              </div>

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
                      minLength={8}
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
            </>
          )}

          {mode === "login" && (
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setMode("forgot");
                }}
                className="text-sm text-[#D4AF37] transition hover:text-[#e1c45b]"
              >
                Forgot password?
              </button>
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

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode("login");
              }}
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
export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
          <div className="text-sm text-white/50">Loading...</div>
        </main>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}