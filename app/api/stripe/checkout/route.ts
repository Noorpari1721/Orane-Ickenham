import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeSecretKey);

type CheckoutRequest = {
  serviceName: string;
  price: number;
  duration?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category?: string;
  staffName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;

    const {
      serviceName,
      price,
      duration,
      customerName,
      customerEmail,
      customerPhone,
      category,
      staffName,
      appointmentDate,
      appointmentTime,
    } = body;

    if (!serviceName) {
      return NextResponse.json(
        { error: "Service is required." },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Customer name and email are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "A valid booking price is required." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: customerEmail,

      line_items: [
        {
          price_data: {
            currency: "gbp",

            product_data: {
              name: serviceName,
              description: duration
                ? `${duration} appointment at ORANE Ickenham`
                : "Appointment at ORANE Ickenham",
            },

            unit_amount: Math.round(price * 100),
          },

          quantity: 1,
        },
      ],

      metadata: {
        serviceName,
        customerName,
        customerEmail,
        customerPhone: customerPhone ?? "",
        category: category ?? "",
        staffName: staffName ?? "",
        appointmentDate: appointmentDate ?? "",
        appointmentTime: appointmentTime ?? "",
        duration: duration ?? "",
      },

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${origin}/booking`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe Checkout URL was not created." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout error:", error);

    return NextResponse.json(
      {
        error: "Unable to create Stripe Checkout session.",
      },
      { status: 500 }
    );
  }
}