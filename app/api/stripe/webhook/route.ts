import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

type BookingMetadata = {
  serviceId?: string;

  serviceIds?: string;
  serviceName?: string;

  serviceNames?: string;
  serviceBilling?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  category?: string;
  staffId?: string;
  staffName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: string;
  price?: string;
  consultationStatus?: string;
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

function splitCustomerName(fullName: string) {
  const cleaned = fullName.trim();

  if (!cleaned) {
    return {
      firstName: "Customer",
      lastName: "Customer",
    };
  }

  const parts = cleaned.split(/\s+/);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: parts[0],
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function createEndTime(
  startTime: string,
  duration?: string
) {
  if (!startTime || !duration) {
    return null;
  }

  const numericDuration = Number(duration);

  if (Number.isFinite(numericDuration)) {
    const parts = startTime.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

    if (!parts) {
      return null;
    }

    let hour = Number(parts[1]);
    const minute = Number(parts[2]);
    const meridiem = parts[3]?.toUpperCase();

    if (meridiem === "PM" && hour < 12) {
      hour += 12;
    }

    if (meridiem === "AM" && hour === 12) {
      hour = 0;
    }

    const totalMinutes =
      hour * 60 + minute + numericDuration;

    const endHour =
      Math.floor(totalMinutes / 60) % 24;

    const endMinute = totalMinutes % 60;

    const displayHour = endHour % 12 || 12;
    const displayMeridiem =
      endHour >= 12 ? "PM" : "AM";

    return `${String(displayHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")} ${displayMeridiem}`;
  }

  const match = duration.match(
    /(?:(\d+)\s*hr|(\d+)\s*hour|(\d+)\s*hours)?\s*(?:(\d+)\s*min|(\d+)\s*mins|(\d+)\s*minutes)?/i
  );

  if (!match) {
    return null;
  }

  const hours =
    Number(match[1] || match[2] || match[3] || 0);

  const minutes =
    Number(match[4] || match[5] || match[6] || 0);

  const parts = startTime.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
  );

  if (!parts) {
    return null;
  }

  let hour = Number(parts[1]);
  const minute = Number(parts[2]);
  const meridiem = parts[3]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  const totalMinutes =
    hour * 60 +
    minute +
    hours * 60 +
    minutes;

  const endHour =
    Math.floor(totalMinutes / 60) % 24;

  const endMinute = totalMinutes % 60;

  const displayHour = endHour % 12 || 12;
  const displayMeridiem =
    endHour >= 12 ? "PM" : "AM";

  return `${String(displayHour).padStart(2, "0")}:${String(
    endMinute
  ).padStart(2, "0")} ${displayMeridiem}`;
}

async function getNextCustomerNumber(
  prisma: PrismaClient
) {
  const existingCustomerNumbers =
    await prisma.customer.findMany({
      select: {
        customerNo: true,
      },
    });

  const highestCustomerNumber =
    existingCustomerNumbers.reduce(
      (highest, customer) => {
        const match =
          customer.customerNo.match(
            /^CUS-(\d+)$/
          );

        if (!match) {
          return highest;
        }

        return Math.max(
          highest,
          Number(match[1])
        );
      },
      0
    );

  return `CUS-${String(
    highestCustomerNumber + 1
  ).padStart(3, "0")}`;
}

async function upsertCustomer(
  prisma: any,
  metadata: BookingMetadata,
  firstName: string,
  lastName: string
) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const customerNo =
        await getNextCustomerNumber(prisma);

      return await prisma.customer.upsert({
        where: {
          email: metadata.customerEmail!,
        },
        update: {
          firstName,
          lastName,
          phone:
            metadata.customerPhone ||
            undefined,
          status: "ACTIVE",
        },
        create: {
          customerNo,
          firstName,
          lastName,
          email: metadata.customerEmail!,
          phone:
            metadata.customerPhone || null,
          status: "ACTIVE",
        },
      });
    } catch (error) {
      console.error(
        `Customer upsert attempt ${attempt} failed:`,
        error
      );

      if (attempt === 5) {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to create or update customer."
  );
}

async function sendBookingEmails(
  metadata: BookingMetadata,
  paymentReference: string,
  amountPaid: number,
  bookingNo?: string,
  paymentNo?: string
) {
  const customerEmail = metadata.customerEmail;

  if (!customerEmail) {
    throw new Error(
      "Customer email is missing from Stripe metadata."
    );
  }

  const customerName = escapeHtml(
    metadata.customerName || "Customer"
  );

  const appointmentTime = escapeHtml(
    metadata.appointmentTime || "Not selected"
  );

  const duration = escapeHtml(
    metadata.duration || "Not provided"
  );

  const customerDuration =
    /^\d+$/.test((metadata.duration || "").trim())
      ? `${escapeHtml((metadata.duration || "").trim())} mins`
      : duration;

  const customerPhone = escapeHtml(
    metadata.customerPhone || "Not provided"
  );

  const appointmentDate = escapeHtml(
    formatAppointmentDate(
      metadata.appointmentDate || ""
    )
  );

  const paymentId = escapeHtml(paymentReference);

  const paidAmount = Number(amountPaid || 0);

  let billingItems: Array<{
    name: string;
    price: number;
  }> = [];

  if (metadata.serviceBilling) {
    try {
      const parsed = JSON.parse(
        metadata.serviceBilling
      );

      if (Array.isArray(parsed)) {
        billingItems = parsed
          .map((item) => ({
            name: String(
              item?.name || "Service"
            ),
            price: Number(
              item?.price || 0
            ),
          }))
          .filter(
            (item) =>
              item.name &&
              Number.isFinite(item.price)
          );
      }
    } catch (error) {
      console.warn(
        "Unable to parse service billing metadata:",
        error
      );
    }
  }

  if (billingItems.length === 0) {
    const fallbackNames =
      metadata.serviceNames ||
      metadata.serviceName ||
      "Selected service";

    billingItems = fallbackNames
      .split(",")
      .map((name) => ({
        name: name.trim(),
        price: 0,
      }))
      .filter(
        (item) => item.name
      );
  }

  const billingRows = billingItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#333;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;text-align:right;color:#333;">
            £${item.price.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const billingHtml = `
    <div style="margin:28px 0;padding:24px;background:#faf8f4;border:1px solid #e7dfd0;">
      <h2 style="margin:0 0 18px;font-weight:400;color:#222;">
        Payment / Billing
      </h2>

      <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
        <thead>
          <tr>
            <th style="padding:0 0 10px;text-align:left;color:#888;font-weight:400;">
              Service
            </th>
            <th style="padding:0 0 10px;text-align:right;color:#888;font-weight:400;">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${billingRows}
        </tbody>

        <tfoot>
          <tr>
            <td style="padding:16px 0 0;font-weight:bold;color:#222;">
              Total Paid
            </td>
            <td style="padding:16px 0 0;text-align:right;font-size:18px;font-weight:bold;color:#b28a32;">
              £${paidAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid #e7dfd0;font-size:13px;color:#666;">

        <p style="margin:5px 0;">
          <strong>Payment Status:</strong> PAID
        </p>

        <p style="margin:5px 0;">
          <strong>Payment Method:</strong> Stripe
        </p>

        ${
          bookingNo
            ? `
              <p style="margin:5px 0;">
                <strong>Booking No:</strong>
                ${escapeHtml(bookingNo)}
              </p>
            `
            : ""
        }

        ${
          paymentNo
            ? `
              <p style="margin:5px 0;">
                <strong>Payment No:</strong>
                ${escapeHtml(paymentNo)}
              </p>
            `
            : ""
        }

        <p style="margin:5px 0;word-break:break-all;">
          <strong>Payment Reference:</strong>
          ${paymentId}
        </p>

      </div>
    </div>
  `;

  const customerBillingHtml = `
    <div style="margin:28px 0;padding:24px;background:#faf8f4;border:1px solid #e7dfd0;">
      <h2 style="margin:0 0 18px;font-weight:400;color:#222;">
        Payment / Billing
      </h2>

      <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
        <thead>
          <tr>
            <th style="padding:0 0 10px;text-align:left;color:#888;font-weight:400;">
              Service
            </th>
            <th style="padding:0 0 10px;text-align:right;color:#888;font-weight:400;">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${billingRows}
        </tbody>

        <tfoot>
          <tr>
            <td style="padding:16px 0 0;font-weight:bold;color:#222;">
              Total Paid
            </td>
            <td style="padding:16px 0 0;text-align:right;font-size:18px;font-weight:bold;color:#b28a32;">
              £${paidAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid #e7dfd0;font-size:13px;color:#666;">

        <p style="margin:5px 0;">
          <strong>Payment Status:</strong> PAID
        </p>

        <p style="margin:5px 0;">
          <strong>Payment Method:</strong> Stripe
        </p>

      </div>
    </div>
  `;
  const customerHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:680px;margin:0 auto;">

      <div style="padding:28px 24px;background:#111;color:#fff;text-align:center;">
        <div style="font-size:11px;letter-spacing:4px;color:#d4af5a;">
          ORANE ICKENHAM
        </div>

        <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-weight:400;">
          Booking Confirmed
        </h1>
      </div>

      <div style="padding:28px 24px;">

        <p>
          Dear ${customerName},
        </p>

        <p>
          Thank you for choosing <strong>ORANE Ickenham</strong>.
          Your appointment and payment have been successfully confirmed.
        </p>

        <h2 style="font-weight:400;">
          Appointment Details
        </h2>

        <p>
          <strong>Services:</strong>
          ${escapeHtml(
            metadata.serviceNames ||
            metadata.serviceName ||
            "Selected service"
          )}
        </p>

        <p>
          <strong>Duration:</strong>
          ${customerDuration}
        </p>

        <p>
          <strong>Date:</strong>
          ${appointmentDate}
        </p>

        <p>
          <strong>Time:</strong>
          ${appointmentTime}
        </p>

        ${customerBillingHtml}

        <h2 style="font-weight:400;">
          Your Details
        </h2>

        <p>
          <strong>Name:</strong>
          ${customerName}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(customerEmail)}
        </p>

        <p>
          <strong>Phone:</strong>
          ${customerPhone}
        </p>

        <p style="margin-top:28px;">
          We look forward to welcoming you to ORANE Ickenham.
        </p>

        <p>
          Kind regards,<br />
          <strong>ORANE Ickenham</strong>
        </p>

      </div>
    </div>
  `;

  const salonHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:680px;margin:0 auto;">

      <div style="padding:28px 24px;background:#111;color:#fff;text-align:center;">
        <div style="font-size:11px;letter-spacing:4px;color:#d4af5a;">
          ORANE ICKENHAM
        </div>

        <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-weight:400;">
          New Paid Booking
        </h1>
      </div>

      <div style="padding:28px 24px;">

        <p>
          A new appointment has been successfully paid for through the
          ORANE Ickenham website.
        </p>

        <h2 style="font-weight:400;">
          Appointment
        </h2>

        <p>
          <strong>Services:</strong>
          ${escapeHtml(
            metadata.serviceNames ||
            metadata.serviceName ||
            "Selected service"
          )}
        </p>

        <p>
          <strong>Duration:</strong>
          ${duration}
        </p>

        <p>
          <strong>Date:</strong>
          ${appointmentDate}
        </p>

        <p>
          <strong>Time:</strong>
          ${appointmentTime}
        </p>

        ${billingHtml}

        <h2 style="font-weight:400;">
          Customer
        </h2>

        <p>
          <strong>Name:</strong>
          ${customerName}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(customerEmail)}
        </p>

        <p>
          <strong>Phone:</strong>
          ${customerPhone}
        </p>

      </div>
    </div>
  `;

  const salonRecipient =
    process.env.BREVO_BOOKING_NOTIFICATION_EMAIL ||
    fromEmail;

  await Promise.all([
    transporter.sendMail({
      from: `"ORANE Ickenham" <${fromEmail}>`,
      to: customerEmail,
      subject:
        "Your ORANE Ickenham booking is confirmed",
      html: customerHtml,
    }),

    transporter.sendMail({
      from: `"ORANE Ickenham Website" <${fromEmail}>`,
      to: salonRecipient,
      subject:
        `New paid booking - ${
          metadata.serviceNames ||
          metadata.serviceName ||
          "Appointment"
        } - £${paidAmount.toFixed(2)}`,
      html: salonHtml,
    }),
  ]);
}
async function sendGiftCardEmails(
  giftCard: {
    giftCardNo: string;
    code: string;
    amount: unknown;
    type: string;
    recipientFirstName: string | null;
    recipientLastName: string | null;
    recipientEmail: string | null;
    purchaserFirstName: string | null;
    purchaserLastName: string | null;
    purchaserEmail: string | null;
    personalMessage: string | null;
    expiresAt: Date;
  },
  paymentReference: string
) {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const recipientEmail =
    giftCard.recipientEmail?.trim() ||
    giftCard.purchaserEmail?.trim();

  if (!recipientEmail) {
    throw new Error(
      `Gift Card ${giftCard.giftCardNo} has no recipient or purchaser email.`
    );
  }

  const recipientName =
    [
      giftCard.recipientFirstName,
      giftCard.recipientLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "there";

  const purchaserEmail =
    giftCard.purchaserEmail?.trim();

  const purchaserName =
    [
      giftCard.purchaserFirstName,
      giftCard.purchaserLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Customer";

  const amount = Number(giftCard.amount).toFixed(2);

  const expiry = giftCard.expiresAt.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const personalMessage =
    giftCard.personalMessage?.trim();

  const recipientHtml = `
    <div style="margin:0;padding:40px 20px;background:#f7f4ef;font-family:Arial,sans-serif;color:#222;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd0;">
        <div style="padding:36px 32px;text-align:center;background:#111111;color:#ffffff;">
          <div style="font-size:11px;letter-spacing:4px;color:#d4af5a;">
            ORANE ICKENHAM
          </div>
          <h1 style="margin:14px 0 0;font-family:Georgia,serif;font-weight:400;font-size:34px;">
            A Gift of Luxury
          </h1>
        </div>

        <div style="padding:34px 32px;">
          <p style="font-size:16px;line-height:1.7;">
            Dear ${escapeHtml(recipientName)},
          </p>

          <p style="font-size:15px;line-height:1.8;color:#555;">
            You have received an ORANE Ickenham Gift Card.
            We look forward to welcoming you for a beautiful
            salon experience.
          </p>

          ${
            personalMessage
              ? `
                <div style="margin:24px 0;padding:20px;border-left:3px solid #d4af5a;background:#faf8f4;">
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#555;">
                    ${escapeHtml(personalMessage)}
                  </p>
                </div>
              `
              : ""
          }

          <div style="margin:28px 0;padding:28px;text-align:center;background:#111111;color:#ffffff;">
            <div style="font-size:10px;letter-spacing:3px;color:#d4af5a;">
              GIFT CARD VALUE
            </div>

            <div style="margin:10px 0;font-family:Georgia,serif;font-size:40px;color:#d4af5a;">
              ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº${amount}
            </div>

            <div style="font-size:10px;letter-spacing:2px;color:#aaa;">
              ${escapeHtml(giftCard.giftCardNo)}
            </div>
          </div>

          <div style="padding:22px;background:#faf8f4;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#999;">
              YOUR GIFT CARD CODE
            </p>

            <p style="margin:0;font-size:24px;letter-spacing:3px;font-weight:bold;color:#222;">
              ${escapeHtml(giftCard.code)}
            </p>
          </div>

          <p style="margin-top:26px;font-size:13px;line-height:1.7;color:#777;">
            Valid until ${escapeHtml(expiry)}.
            Please present your Gift Card code when redeeming
            your voucher at ORANE Ickenham.
          </p>

          <p style="margin-top:28px;font-size:14px;line-height:1.7;">
            With warm regards,<br />
            <strong>ORANE Ickenham</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  const purchaserHtml = `
    <div style="margin:0;padding:40px 20px;background:#f7f4ef;font-family:Arial,sans-serif;color:#222;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;padding:36px 32px;">
        <div style="text-align:center;">
          <div style="font-size:11px;letter-spacing:4px;color:#b28a32;">
            ORANE ICKENHAM
          </div>

          <h1 style="font-family:Georgia,serif;font-weight:400;">
            Gift Card Purchase Confirmed
          </h1>
        </div>

        <p style="font-size:15px;line-height:1.8;color:#555;">
          Dear ${escapeHtml(purchaserName)},
        </p>

        <p style="font-size:15px;line-height:1.8;color:#555;">
          Your ORANE Ickenham Gift Card purchase has been
          successfully completed.
        </p>

        <div style="margin:25px 0;padding:22px;background:#faf8f4;">
          <p style="margin:0 0 8px;color:#777;">
            Gift Card
          </p>

          <p style="margin:0;font-size:20px;font-weight:bold;">
            ${escapeHtml(giftCard.giftCardNo)}
          </p>

          <p style="margin:12px 0 0;font-size:18px;color:#b28a32;">
            ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº${amount}
          </p>

          <p style="margin:8px 0 0;color:#777;">
            Code: ${escapeHtml(giftCard.code)}
          </p>
        </div>

        <p style="font-size:12px;color:#888;">
          Stripe payment reference: ${escapeHtml(paymentReference)}
        </p>

        <p style="margin-top:25px;font-size:14px;line-height:1.7;">
          Thank you for choosing ORANE Ickenham.
        </p>
      </div>
    </div>
  `;

  const messages = [
    transporter.sendMail({
      from: `"ORANE Ickenham" <${fromEmail}>`,
      to: recipientEmail,
      subject:
        "Your ORANE Ickenham Gift Card ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¼",
      html: recipientHtml,
    }),
  ];

  if (
    purchaserEmail &&
    purchaserEmail.toLowerCase() !==
      recipientEmail.toLowerCase()
  ) {
    messages.push(
      transporter.sendMail({
        from: `"ORANE Ickenham" <${fromEmail}>`,
        to: purchaserEmail,
        subject:
          "Your ORANE Ickenham Gift Card purchase is confirmed",
        html: purchaserHtml,
      })
    );
  }

  await Promise.all(messages);

  console.log(
    "Gift Card emails sent successfully:",
    giftCard.giftCardNo
  );
}
async function processGiftCardPayment(
  prisma: PrismaClient,
  session: Stripe.Checkout.Session,
  paymentReference: string,
  amountPaid: number
) {
  const metadata = session.metadata ?? {};

  const giftCardId =
    metadata.giftCardId?.trim();

  if (!giftCardId) {
    throw new Error(
      "Gift Card payment is missing giftCardId metadata."
    );
  }

  const giftCard =
    await prisma.giftCard.findUnique({
      where: {
        id: giftCardId,
      },
    });

  if (!giftCard) {
    throw new Error(
      `Gift Card ${giftCardId} was not found.`
    );
  }

  /*
   * Stripe webhook events can be delivered more than once.
   * If this Gift Card has already been activated, do not
   * create or modify it again.
   */
  if (
    giftCard.status === "ACTIVE" ||
    giftCard.status === "PARTIALLY_REDEEMED" ||
    giftCard.status === "REDEEMED"
  ) {
    console.log(
      "Gift Card payment already processed:",
      giftCard.giftCardNo
    );

    return {
      alreadyProcessed: true,
      giftCard,
    };
  }

  if (giftCard.status !== "PENDING") {
    throw new Error(
      `Gift Card ${giftCard.giftCardNo} cannot be activated because its current status is ${giftCard.status}.`
    );
  }

  /*
   * Never trust the browser amount.
   * The amount stored in our database must match the
   * amount actually paid through Stripe.
   */
  const databaseAmount =
    Number(giftCard.amount);

  const difference =
    Math.abs(
      databaseAmount - amountPaid
    );

  if (difference > 0.01) {
    throw new Error(
      `Gift Card payment amount mismatch for ${giftCard.giftCardNo}. Database: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº${databaseAmount.toFixed(
        2
      )}, Stripe: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº${amountPaid.toFixed(2)}`
    );
  }

  const stripePaymentIntent =
    session.payment_intent
      ? String(session.payment_intent)
      : null;

  const activatedGiftCard =
    await prisma.giftCard.update({
      where: {
        id: giftCard.id,
      },
      data: {
        status: "ACTIVE",
        paidAt: new Date(),
        issuedAt: new Date(),
        remainingAmount:
          giftCard.amount,
        stripePaymentIntent,
        stripeSessionId:
          session.id,
      },
    });

  console.log(
    "Gift Card activated successfully:",
    {
      giftCardNo:
        activatedGiftCard.giftCardNo,
      code:
        activatedGiftCard.code,
      amount:
        activatedGiftCard.amount.toString(),
      stripeSessionId:
        session.id,
      stripePaymentIntent,
    }
  );

  await sendGiftCardEmails(
    activatedGiftCard,
    paymentReference
  );

  return {
    alreadyProcessed: false,
    giftCard: activatedGiftCard,
  };
}
function bookingTimeToMinutes(value: string | null | undefined) {
  if (!value) return -1;

  const match = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
  );

  if (!match) return -1;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return -1;
  }

  return hour * 60 + minute;
}

function bookingTimesOverlap(
  startA: string,
  endA: string | null,
  startB: string,
  endB: string | null
) {
  const aStart = bookingTimeToMinutes(startA);
  const aEnd = bookingTimeToMinutes(endA);
  const bStart = bookingTimeToMinutes(startB);
  const bEnd = bookingTimeToMinutes(endB);

  if (
    aStart < 0 ||
    bStart < 0
  ) {
    return false;
  }

  if (
    aEnd < 0 ||
    bEnd < 0
  ) {
    return aStart === bStart;
  }

  return (
    aStart < bEnd &&
    bStart < aEnd
  );
}

async function findAvailableTechnicianForBooking(
  prisma: any,
  appointmentDate: Date,
  appointmentTime: string,
  requestedEndTime: string | null,
  preferredTechId?: string
) {
  const technicians =
    await prisma.tech.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        techNo: "asc",
      },
      select: {
        id: true,
        techNo: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

  if (technicians.length === 0) {
    return null;
  }

  const techIds =
    technicians.map(
      (tech: any) => tech.id
    );

  const existingBookings =
    await prisma.booking.findMany({
      where: {
        techId: {
          in: techIds,
        },
        date: appointmentDate,
        status: {
          in: [
            "PENDING",
            "CONFIRMED",
          ],
        },
      },
      select: {
        techId: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

  const orderedTechnicians = [
    ...technicians.filter(
      (tech: any) =>
        preferredTechId &&
        tech.id === preferredTechId
    ),
    ...technicians.filter(
      (tech: any) =>
        !preferredTechId ||
        tech.id !== preferredTechId
    ),
  ];

  for (const tech of orderedTechnicians) {
    const conflict =
      existingBookings.some(
        (booking: any) =>
          booking.techId === tech.id &&
          bookingTimesOverlap(
            appointmentTime,
            requestedEndTime,
            booking.startTime,
            booking.endTime
          )
      );

    if (!conflict) {
      return tech;
    }
  }

  return null;
}
async function createBookingRecords(
  metadata: BookingMetadata,
  paymentReference: string,
  amountPaid: number
) {
  const prisma = getPrisma();

  if (
    !metadata.customerName ||
    !metadata.customerEmail
  ) {
    throw new Error(
      "Customer name and email are required."
    );
  }

  if (
    (!metadata.serviceId && !metadata.serviceIds) ||
    !metadata.appointmentDate ||
    !metadata.appointmentTime
  ) {
    throw new Error(
      "Service, appointment date and appointment time are required."
    );
  }

  const {
    firstName,
    lastName,
  } = splitCustomerName(
    metadata.customerName
  );

  /*
   * First duplicate check.
   *
   * Stripe may deliver the same webhook more than once.
   */
  const existingPayment =
    await prisma.payment.findFirst({
      where: {
        transactionId: paymentReference,
      },
      include: {
        booking: true,
      },
    });

  if (existingPayment) {
    console.log(
      "Stripe payment already processed:",
      paymentReference
    );

    return {
      customer: null,
      booking: existingPayment.booking,
      payment: existingPayment,
      alreadyProcessed: true,
    };
  }

  const rawServiceIds =
    metadata.serviceIds?.trim() ||
    metadata.serviceId?.trim() ||
    "";

  let requestedServiceIds: string[] = [];

  /*
   * Stripe metadata stores multi-treatment IDs as JSON.
   * Older single-booking sessions may still contain a
   * single ID or a comma-separated value, so keep those
   * formats supported as well.
   */
  try {
    const parsed = JSON.parse(rawServiceIds);

    if (Array.isArray(parsed)) {
      requestedServiceIds = parsed
        .map((id) => String(id).trim())
        .filter(Boolean);
    } else if (typeof parsed === "string") {
      requestedServiceIds = [parsed.trim()].filter(Boolean);
    }
  } catch {
    requestedServiceIds = rawServiceIds
      .split(",")
      .map((id) =>
        id.trim().replace(/^["\\[]+|["\\]]+$/g, "")
      )
      .filter(Boolean);
  }

  const uniqueServiceIds =
    [...new Set(requestedServiceIds)];

  if (uniqueServiceIds.length === 0) {
    throw new Error(
      "At least one valid service is required."
    );
  }

  const services =
    await prisma.service.findMany({
      where: {
        id: {
          in: uniqueServiceIds,
        },
        active: true,
      },
    });

  if (
    services.length !==
    uniqueServiceIds.length
  ) {
    throw new Error(
      "One or more selected services are no longer available."
    );
  }

  const orderedServices =
    uniqueServiceIds.map(
      (id) =>
        services.find(
          (service) =>
            service.id === id
        )!
    );

  const primaryService =
    orderedServices[0];

  const totalPrice =
    orderedServices.reduce(
      (total, service) =>
        total + Number(service.price),
      0
    );

  if (
    !Number.isFinite(totalPrice) ||
    totalPrice <= 0
  ) {
    throw new Error(
      "The selected services have an invalid database price."
    );
  }

  const totalDuration =
    orderedServices.reduce(
      (total, service) =>
        total + Number(service.duration),
      0
    );

  if (
    !Number.isFinite(totalDuration) ||
    totalDuration <= 0
  ) {
    throw new Error(
      "The selected services have an invalid total duration."
    );
  }

  if (
    Math.round(amountPaid * 100) !==
    Math.round(totalPrice * 100)
  ) {
    throw new Error(
      "Paid amount does not match the current service prices."
    );
  }


  const appointmentDate =
    new Date(metadata.appointmentDate);

  if (
    Number.isNaN(
      appointmentDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid appointment date."
    );
  }

  const requestedEndTime =
    createEndTime(
      metadata.appointmentTime,
      String(totalDuration)
    );

  /*
   * INTERNAL TECHNICIAN ASSIGNMENT
   *
   * The customer never chooses a technician.
   *
   * The technician returned by Step 3 is only a preference.
   * At payment/webhook time we ALWAYS check the complete
   * technician pool again.
   *
   * This prevents a stale Step 3 selection from creating
   * overlapping appointments.
   */
  const tech =
    await findAvailableTechnicianForBooking(
      prisma,
      appointmentDate,
      metadata.appointmentTime!,
      requestedEndTime,
      metadata.staffId
    );

  if (!tech) {
    console.warn(
      "No technician is currently free for the paid appointment. Creating booking unassigned for admin allocation:",
      {
        appointmentDate:
          metadata.appointmentDate,
        appointmentTime:
          metadata.appointmentTime,
        duration:
          totalDuration,
        serviceIds:
          uniqueServiceIds,
      }
    );
  }
  /*
   * Booking and payment must be created together.
   * If either operation fails, neither record is committed.
   */
  const result =
    await prisma.$transaction(
      async (tx) => {
        /*
         * Second duplicate check inside the transaction.
         */
        const duplicatePayment =
          await tx.payment.findFirst({
            where: {
              transactionId:
                paymentReference,
            },
            include: {
              booking: true,
            },
          });

        if (duplicatePayment) {
          return {
            customer: null,
            booking:
              duplicatePayment.booking,
            payment:
              duplicatePayment,
            alreadyProcessed: true,
          };
        }

        const customer =
          await upsertCustomer(
            tx,
            metadata,
            firstName,
            lastName
          );

        const existingBookingNumbers =
          await tx.booking.findMany({
            select: {
              bookingNo: true,
            },
          });

        const highestBookingNumber =
          existingBookingNumbers.reduce(
            (highest, booking) => {
              const match =
                booking.bookingNo.match(
                  /^BK-(\d+)$/
                );

              if (!match) {
                return highest;
              }

              return Math.max(
                highest,
                Number(match[1])
              );
            },
            0
          );

        const bookingNo =
          `BK-${String(
            highestBookingNumber + 1
          ).padStart(3, "0")}`;

        const booking =
          await tx.booking.create({
            data: {
              bookingNo,
              date: appointmentDate,
              startTime: metadata.appointmentTime!,
              endTime:
                requestedEndTime,
              status: "CONFIRMED",
              consultationStatus:
                metadata.consultationStatus ??
                "existing-unchanged",
              customerId:
                customer.id,

              /*
               * serviceId remains the primary treatment for
               * backwards compatibility with existing admin,
               * availability and reporting code.
               */
              serviceId: primaryService.id,

              /*
               * Technician is assigned internally after the
               * final availability check. It is never customer-
               * selectable.
               */
              techId:
                tech?.id ?? null,

              /*
               * The complete appointment is stored here.
               * A single booking can therefore contain one
               * or many treatments.
               */
              bookingServices: {
                create: orderedServices.map(
                  (service) => ({
                    serviceId: service.id,
                  })
                ),
              },
            },
          });

        const existingPaymentNumbers =
          await tx.payment.findMany({
            select: {
              paymentNo: true,
            },
          });

        const highestPaymentNumber =
          existingPaymentNumbers.reduce(
            (highest, payment) => {
              const match =
                payment.paymentNo.match(
                  /^PAY-(\d+)$/
                );

              if (!match) {
                return highest;
              }

              return Math.max(
                highest,
                Number(match[1])
              );
            },
            0
          );

        const paymentNo =
          `PAY-${String(
            highestPaymentNumber + 1
          ).padStart(3, "0")}`;

        const payment =
          await tx.payment.create({
            data: {
              paymentNo,
              amount: amountPaid,
              method: "STRIPE",
              status: "PAID",
              transactionId:
                paymentReference,
              paidAt: new Date(),
              bookingId:
                booking.id,
              customerId:
                customer.id,
            },
          });

        return {
          customer,
          booking,
          payment,
          alreadyProcessed: false,
        };
      }
    );

  console.log(
    "Booking/payment transaction completed:",
    {
      bookingNo:
        result.booking.bookingNo,
      paymentNo:
        result.payment.paymentNo,
      customerNo:
        result.customer?.customerNo ??
        "EXISTING",
      techNo:
        tech?.techNo ??
        "UNASSIGNED",
    }
  );

  return result;
}

export async function POST(
  request: Request
) {
  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is not configured."
    );

    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature.",
      },
      {
        status: 400,
      }
    );
  }

  const rawBody =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid Stripe webhook signature.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      if (
        session.payment_status !==
        "paid"
      ) {
        return NextResponse.json({
          received: true,
          processed: false,
          reason:
            "Payment is not marked as paid.",
        });
      }

      const metadata =
        session.metadata ?? {};

      const paymentReference =
        session.payment_intent
          ? String(
              session.payment_intent
            )
          : session.id;

      const amountPaid =
        (session.amount_total ?? 0) /
        100;

      /*
       * Gift Card payments use the same Stripe webhook
       * but have paymentType=gift_card in metadata.
       *
       * Handle them separately so the existing booking
       * payment flow remains unchanged.
       */
      if (
        metadata.paymentType ===
        "gift_card"
      ) {
        const prisma = getPrisma();

        const result =
          await processGiftCardPayment(
            prisma,
            session,
            paymentReference,
            amountPaid
          );

        return NextResponse.json({
          received: true,
          processed: true,
          type: "gift_card",
          giftCardNo:
            result.giftCard.giftCardNo,
          alreadyProcessed:
            result.alreadyProcessed,
        });
      }

      const result =
        await createBookingRecords(
          metadata,
          paymentReference,
          amountPaid
        );

      if (!result.alreadyProcessed) {
        await sendBookingEmails(
          metadata,
          paymentReference,
          amountPaid,
          result.booking.bookingNo,
          result.payment.paymentNo
        );

        console.log(
          "Paid booking emails sent successfully:",
          session.id
        );
      } else {
        console.log(
          "Skipping duplicate email for already processed payment:",
          paymentReference
        );
      }

      return NextResponse.json({
        received: true,
        processed: true,
        bookingNo:
          result.booking.bookingNo,
        paymentNo:
          result.payment.paymentNo,
      });
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
      {
        error:
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
