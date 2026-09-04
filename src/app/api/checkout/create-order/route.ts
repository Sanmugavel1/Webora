import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { PRICING_PACKAGES } from "@/lib/data/pricing";

const PURCHASABLE_PACKAGES = [...PRICING_PACKAGES];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body === "object" && body !== null ? (body as Record<string, unknown>).slug : undefined;
  const pkg = PURCHASABLE_PACKAGES.find((p) => p.slug === slug);

  // The charge amount always comes from our own pricing data, never from the client —
  // a tampered request could otherwise ask us to charge ₹1 for a ₹9,999 package.
  if (!pkg || !pkg.amountInPaise) {
    return NextResponse.json(
      { error: "Unknown or non-purchasable package." },
      { status: 400 },
    );
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: pkg.amountInPaise,
      currency: "INR",
      receipt: `webora_${pkg.slug}_${Date.now()}`,
      notes: { package: pkg.name },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      packageName: pkg.name,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again or contact us directly." },
      { status: 502 },
    );
  }
}
