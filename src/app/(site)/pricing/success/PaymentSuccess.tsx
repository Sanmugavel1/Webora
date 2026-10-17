"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";

export function PaymentSuccess() {
  const params = useSearchParams();
  const packageName = params.get("package") ?? "your package";
  const paymentId = params.get("paymentId");

  return (
    <section className="relative bg-navy-deep px-5 py-32 sm:px-8 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-blue-soft" strokeWidth={1.5} />
        <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">
          Payment received!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist">
          Thanks for choosing the <span className="text-white">{packageName}</span>. We&rsquo;ve
          got your payment and will reach out on WhatsApp or email within 24 hours to kick off
          your project.
        </p>
        {paymentId && (
          <p className="mt-4 text-xs text-white/35">
            Payment reference: <span className="font-mono text-white/50">{paymentId}</span> —
            keep this for your records.
          </p>
        )}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button href={`https://wa.me/${WHATSAPP_NUMBER}`} variant="primary" external>
            MESSAGE US ON WHATSAPP
          </Button>
          <Button href="/" variant="secondary">
            BACK TO HOME
          </Button>
        </div>
        <p className="mt-8 text-xs text-white/35">
          Questions about your payment? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-soft underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
