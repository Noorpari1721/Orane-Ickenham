import nodemailer from "nodemailer";

export async function sendCustomerPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT ?? 587);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;
  const from = process.env.BREVO_FROM_EMAIL;

  if (!host || !user || !pass || !from) {
    throw new Error("Customer password reset email configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"ORANE ICKENHAM" <${from}>`,
    to: email,
    subject: "Reset your ORANE ICKENHAM password",
    text: [
      "ORANE ICKENHAM",
      "",
      "We received a request to reset your account password.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 1 hour.",
      "",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <div style="background:#0b0b0b;padding:40px 20px;font-family:Arial,sans-serif;color:#f5f1e8;">
        <div style="max-width:560px;margin:0 auto;background:#151515;border:1px solid rgba(212,175,55,.28);border-radius:20px;padding:36px;">
          <div style="font-size:11px;letter-spacing:4px;color:#d4af37;font-weight:700;">
            ORANE ICKENHAM
          </div>

          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;margin:18px 0 10px;color:#ffffff;">
            Reset your password
          </h1>

          <p style="color:#a8a39a;line-height:1.7;">
            We received a request to reset your ORANE account password.
          </p>

          <div style="margin:30px 0;">
            <a
              href="${resetUrl}"
              style="display:inline-block;background:#d4af37;color:#090909;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;"
            >
              Reset Password
            </a>
          </div>

          <p style="color:#8f8b84;font-size:13px;line-height:1.7;">
            This link expires in 1 hour.
          </p>

          <p style="color:#8f8b84;font-size:13px;line-height:1.7;">
            If you did not request this password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}