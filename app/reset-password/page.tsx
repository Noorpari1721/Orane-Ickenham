"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isResetMode = Boolean(token);

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/customer/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to process your request."
        );
      }

      setSuccess(
        "If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/customer/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to reset your password."
        );
      }

      setSuccess(
        "Your password has been reset successfully. Redirecting to My Account..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/account");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 py-12 text-white">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.38em] text-[#D4AF37]">
            Orane Ickenham
          </p>

          <h1 className="mt-4 text-3xl font-light tracking-wide sm:text-4xl">
            {isResetMode
              ? "Create a New Password"
              : "Forgot Your Password?"}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
            {isResetMode
              ? "Choose a new secure password for your customer account."
              : "Enter your email address and we will send you a secure password reset link."}
          </p>
        </div>

        <div className="rounded-3xl border border-[#D4AF37]/20 bg-white/[0.035] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-4 py-3 text-sm leading-6 text-[#e7cf78]">
              {success}
            </div>
          )}

          {!isResetMode && (
            <form
              onSubmit={handleForgotPassword}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
                  />

                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3.5 text-sm font-medium text-black transition hover:bg-[#e1c45b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          {isResetMode && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50"
                >
                  New Password
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
                  />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/45 transition hover:text-[#D4AF37]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
                  />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repeat your new password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/45 transition hover:text-[#D4AF37]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3.5 text-sm font-medium text-black transition hover:bg-[#e1c45b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {!isResetMode && (
            <button
              type="button"
              onClick={() => router.replace("/account")}
              className="mt-6 w-full text-center text-sm text-white/45 transition hover:text-[#D4AF37]"
            >
              Back to My Account
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white/50">
          Loading...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
