import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(
    process.env.BREVO_SMTP_PORT || "587"
  );
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;
  const from = process.env.BREVO_FROM_EMAIL;

  if (
    !host ||
    !user ||
    !pass ||
    !from
  ) {
    throw new Error(
      "Brevo SMTP configuration is incomplete."
    );
  }

  const transporter =
    nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your Orane Ickenham admin password",
    text:
      "You requested a password reset for your Orane Ickenham admin account.\n\n" +
      `Reset your password here:\n${resetUrl}\n\n` +
      "This link expires in 1 hour.\n\n" +
      "If you did not request this, you can safely ignore this email.",
    html: `
      <div style="font-family:Arial,sans-serif;background:#090909;padding:40px;color:#ffffff;">
        <div style="max-width:600px;margin:auto;background:#151515;padding:35px;border-radius:16px;">
          <p style="color:#D4AF37;letter-spacing:3px;font-size:12px;">
            ORANE ICKENHAM
          </p>

          <h1 style="font-weight:400;">
            Reset your admin password
          </h1>

          <p style="color:#cccccc;line-height:1.6;">
            We received a request to reset the password for your admin account.
          </p>

          <p style="margin:30px 0;">
            <a
              href="${resetUrl}"
              style="background:#D4AF37;color:#000000;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold;"
            >
              Reset Password
            </a>
          </p>

          <p style="color:#888888;font-size:13px;">
            This link expires in 1 hour.
          </p>

          <p style="color:#888888;font-size:13px;">
            If you did not request this password reset, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
