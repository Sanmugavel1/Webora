import { redirect } from "next/navigation";
import Image from "next/image";
import { currentUser } from "@/lib/crm/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentUser()) redirect("/crm");
  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center px-4 py-16">
      <div className="crm-card w-full max-w-sm p-7 sm:p-8">
        <div className="mb-7 flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" width={36} height={36} />
          <div>
            <p className="font-display text-lg font-bold tracking-wide">WEBORA</p>
            <p className="text-xs text-[var(--crm-ink-3)]">Growth CRM</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
