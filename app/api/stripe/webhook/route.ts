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
  serviceName?: string;
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
  paymentReference: string
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

  const serviceName = escapeHtml(
    metadata.serviceName || "Selected service"
  );

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
    formatAppointmentDate(
      metadata.appointmentDate || ""
    )
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
          metadata.serviceName || "Appointment"
        }`,
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
              £${amount}
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
            £${amount}
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
        "Your ORANE Ickenham Gift Card 🎁",
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
      `Gift Card payment amount mismatch for ${giftCard.giftCardNo}. Database: £${databaseAmount.toFixed(
        2
      )}, Stripe: £${amountPaid.toFixed(2)}`
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
    !metadata.serviceId ||
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

  const service =
    await prisma.service.findUnique({
      where: {
        id: metadata.serviceId,
      },
    });

  if (!service || !service.active) {
    throw new Error(
      `Service is no longer available: ${metadata.serviceId}`
    );
  }

  const databasePrice = Number(service.price);

  if (
    !Number.isFinite(databasePrice) ||
    databasePrice <= 0
  ) {
    throw new Error(
      "The selected service has an invalid database price."
    );
  }

  /*
   * Stripe is the payment source of truth, but the amount
   * must still match the current database service price.
   */
  if (
    Math.round(amountPaid * 100) !==
    Math.round(databasePrice * 100)
  ) {
    throw new Error(
      "Paid amount does not match the current service price."
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
      metadata.duration ||
        String(service.duration)
    );

  /*
   * Internal technician assignment.
   *
   * The customer never selects a technician.
   * If the originally assigned technician has become
   * unavailable or booked during payment processing,
   * we safely create the paid booking without a technician
   * instead of losing the booking after payment.
   */
  let tech = null;

  if (metadata.staffId) {
    const candidateTech =
      await prisma.tech.findUnique({
        where: {
          id: metadata.staffId,
        },
      });

    if (candidateTech) {
      if (candidateTech.status === "AVAILABLE") {
        const existingBookings =
          await prisma.booking.findMany({
            where: {
              techId: candidateTech.id,
              date: appointmentDate,
              status: {
                in: [
                  "PENDING",
                  "CONFIRMED",
                ],
              },
            },
            select: {
              startTime: true,
              endTime: true,
            },
          });

        const toMinutes = (
          value: string
        ) => {
          const match = value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
          );

          if (!match) {
            return 0;
          }

          let hour = Number(match[1]);
          const minute = Number(match[2]);
          const meridiem =
            match[3]?.toUpperCase();

          if (
            meridiem === "PM" &&
            hour < 12
          ) {
            hour += 12;
          }

          if (
            meridiem === "AM" &&
            hour === 12
          ) {
            hour = 0;
          }

          return hour * 60 + minute;
        };

        const timesOverlap = (
          startA: string,
          endA: string | null,
          startB: string,
          endB: string | null
        ) => {
          if (!endA || !endB) {
            return startA === startB;
          }

          const aStart =
            toMinutes(startA);
          const aEnd =
            toMinutes(endA);
          const bStart =
            toMinutes(startB);
          const bEnd =
            toMinutes(endB);

          return (
            aStart < bEnd &&
            bStart < aEnd
          );
        };

        const conflict =
          existingBookings.find(
            (existing) =>
              timesOverlap(
                metadata.appointmentTime!,
                requestedEndTime,
                existing.startTime,
                existing.endTime
              )
          );

        if (!conflict) {
          tech = candidateTech;
        } else {
          console.warn(
            "Assigned technician became unavailable because of a booking conflict. Creating booking unassigned:",
            candidateTech.id
          );
        }
      } else {
        console.warn(
          "Assigned technician became unavailable during payment processing. Creating booking unassigned:",
          candidateTech.id
        );
      }
    } else {
      console.warn(
        "Assigned technician no longer exists. Creating booking unassigned:",
        metadata.staffId
      );
    }
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
              customerId:
                customer.id,
              serviceId:
                service.id,
              techId:
                tech?.id ?? null,
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
          paymentReference
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
