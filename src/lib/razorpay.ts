import Razorpay from "razorpay";

/**
 * Server-only Razorpay client. Never import this from a "use client" component —
 * it reads the secret key and will crash (intentionally) if that's missing.
 */
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local (see .env.local.example).",
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
