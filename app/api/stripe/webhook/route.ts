import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeSecretKey);

const smtpHost = process.env.BREVO_SMTP_HOST;
const smtpPort = Number(process.env.BREVO_SMTP_PORT || "587");
const smtpUser = process.env.BREVO_SMTP_USER;
const smtpPass = process.env.BREVO_SMTP_PASS;
const fromEmail = process.env.BREVO_FROM_EMAIL;

if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
  throw new Error("Brevo SMTP configuration is incomplete.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

type BookingMetadata = {
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  category?: string;
  staffName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: string;
};

function formatAppointmentDate(value: string) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendBookingEmails(
  metadata: BookingMetadata,
  paymentReference: string
) {
  const customerEmail = metadata.customerEmail;

  if (!customerEmail) {
    throw new Error("Customer email is missing from Stripe metadata.");
  }

  const customerName = escapeHtml(metadata.customerName || "Customer");
  const serviceName = escapeHtml(
    metadata.serviceName || "Selected service"
  );
  const staffName = escapeHtml(metadata.staffName || "Not selected");
  const appointmentTime = escapeHtml(
    metadata.appointmentTime || "Not selected"
  );
  const duration = escapeHtml(
    metadata.duration || "Not provided"
  );
  const customerPhone = escapeHtml(
    metadata.customerPhone || "Not provided"
  );
  const appointmentDate = escapeHtml(
    formatAppointmentDate(metadata.appointmentDate || "")
  );
  const paymentId = escapeHtml(paymentReference);

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h1 style="font-weight:400;">Booking Confirmed</h1>

      <p>Dear ${customerName},</p>

      <p>
        Thank you for choosing <strong>ORANE Ickenham</strong>.
        Your appointment and payment have been successfully confirmed.
      </p>

      <h2 style="font-weight:400;">Appointment Details</h2>

      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Duration:</strong> ${duration}</p>
      <p><strong>Specialist:</strong> ${staffName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>

      <h2 style="font-weight:400;">Your Details</h2>

      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>

      <p><strong>Payment Reference:</strong> ${paymentId}</p>

      <p>
        We look forward to welcoming you to ORANE Ickenham.
      </p>

      <p>
        Kind regards,<br />
        ORANE Ickenham
      </p>
    </div>
  `;

  const salonHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h1 style="font-weight:400;">New Paid Booking</h1>

      <p>
        A new appointment has been successfully paid for through the
        ORANE Ickenham website.
      </p>

      <h2 style="font-weight:400;">Appointment</h2>

      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Duration:</strong> ${duration}</p>
      <p><strong>Specialist:</strong> ${staffName}</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>

      <h2 style="font-weight:400;">Customer</h2>

      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>

      <p><strong>Stripe Payment:</strong> ${paymentId}</p>
    </div>
  `;

  const salonRecipient =
    process.env.BREVO_BOOKING_NOTIFICATION_EMAIL || fromEmail;

  await Promise.all([
    transporter.sendMail({
      from: `"ORANE Ickenham" <${fromEmail}>`,
      to: customerEmail,
      subject: "Your ORANE Ickenham booking is confirmed",
      html: customerHtml,
    }),

    transporter.sendMail({
      from: `"ORANE Ickenham Website" <${fromEmail}>`,
      to: salonRecipient,
      subject: `New paid booking - ${metadata.serviceName || "Appointment"}`,
      html: salonHtml,
    }),
  ]);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");

    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret!
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({
          received: true,
          processed: false,
          reason: "Payment is not marked as paid.",
        });
      }

      const metadata = session.metadata ?? {};

      await sendBookingEmails(
        metadata,
        session.payment_intent
          ? String(session.payment_intent)
          : session.id
      );

      console.log(
        "Paid booking emails sent successfully:",
        session.id
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing failed:",
      error
    );

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}