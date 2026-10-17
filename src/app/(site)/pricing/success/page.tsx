import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccess } from "./PaymentSuccess";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  );
}
