"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL, PHONE_TEL, WHATSAPP_NUMBER } from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Loads the Razorpay Checkout script once and caches the in-flight promise. */
let checkoutScriptPromise: Promise<void> | null = null;
function loadCheckoutScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_SCRIPT_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load the payment provider. Check your connection and try again."));
      document.body.appendChild(script);
    });
  }
  return checkoutScriptPromise;
}

interface CheckoutButtonProps {
  slug: string;
  packageName: string;
  className?: string;
}

export function CheckoutButton({ slug, packageName, className }: CheckoutButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    setErrorMessage("");

    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Could not start checkout.");

      await loadCheckoutScript();

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WEBORA",
        description: orderData.packageName,
        order_id: orderData.orderId,
        theme: { color: "#1677ff" },
        // Surface UPI (with GPay/PhonePe/Paytm intent icons) as the first, featured
        // payment block. This only shows if UPI is enabled on the Razorpay account —
        // no client-side config can force-enable a method the account doesn't have on.
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi", flows: ["intent", "collect", "qr"] }],
              },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: unknown) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error("We couldn't confirm your payment. If you were charged, please contact us with your payment ID.");
            }
            router.push(
              `/pricing/success?package=${encodeURIComponent(packageName)}&paymentId=${encodeURIComponent(verifyData.paymentId)}`,
            );
          } catch (err) {
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Something went wrong confirming your payment.");
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });

      razorpay.on("payment.failed", () => {
        setStatus("error");
        setErrorMessage("Payment failed or was declined. No amount was charged — please try again.");
      });

      razorpay.open();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not start checkout.");
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="primary"
        onClick={handleClick}
        className="w-full justify-center"
        showArrow={status !== "loading"}
      >
        {status === "loading" ? "STARTING CHECKOUT…" : "PAY & GET STARTED"}
      </Button>
      {status === "error" && (
        <p className="mt-3 text-center text-xs leading-relaxed text-white/60">
          {errorMessage} Or reach us directly:{" "}
          <a href={`tel:${PHONE_TEL}`} className="text-blue-soft underline">
            call
          </a>
          ,{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-soft underline"
          >
            WhatsApp
          </a>
          , or{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-soft underline">
            email
          </a>
          .
        </p>
      )}
    </div>
  );
}
