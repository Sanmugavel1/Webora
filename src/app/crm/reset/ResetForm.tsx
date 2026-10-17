"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "../actions";
import { PasswordInput } from "@/components/crm/SettingsForms";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, null);
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#5ee39a]">{state.ok}</p>
        <Link href="/crm/login" className="crm-btn crm-btn-primary w-full">Go to sign in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <PasswordInput name="new_password" label="New password (at least 8 characters)" autoComplete="new-password" />
      <PasswordInput name="confirm_password" label="Type it again" autoComplete="new-password" />
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      <button type="submit" disabled={pending} className="crm-btn crm-btn-primary w-full">{pending ? "Saving…" : "Save new password"}</button>
    </form>
  );
}
