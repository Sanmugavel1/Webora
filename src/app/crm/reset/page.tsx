import Image from "next/image";
import Link from "next/link";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Set a new password" };

export default async function ResetPage({ searchParams }: PageProps<"/crm/reset">) {
  const token = (await searchParams).token;
  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center px-4 py-16">
      <div className="crm-card w-full max-w-sm p-7 sm:p-8">
        <div className="mb-7 flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" width={36} height={36} />
          <div>
            <p className="font-display text-lg font-bold tracking-wide">WEBORA</p>
            <p className="text-xs text-[var(--crm-ink-3)]">Set a new password</p>
          </div>
        </div>
        {typeof token === "string" && token ? (
          <ResetForm token={token} />
        ) : (
          <p className="text-sm text-[var(--crm-ink-2)]">This link is incomplete. <Link href="/crm/login" className="underline">Request a new one</Link>.</p>
        )}
      </div>
    </div>
  );
}
