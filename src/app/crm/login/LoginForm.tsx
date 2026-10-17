"use client";

import { useActionState, useState } from "react";
import { loginAction, requestPasswordResetAction } from "../actions";
import { PasswordInput } from "@/components/crm/SettingsForms";

export function LoginForm() {
  const [forgot, setForgot] = useState(false);
  const [state, action, pending] = useActionState(loginAction, null);
  if (forgot) return <ForgotForm email={state?.email ?? ""} onBack={() => setForgot(false)} />;
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="crm-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state?.email} className="crm-input" />
      </div>
      <PasswordInput name="password" label="Password" autoComplete="current-password" />
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      <button type="submit" disabled={pending} className="crm-btn crm-btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <button type="button" onClick={() => setForgot(true)} className="block w-full text-center text-xs text-[var(--crm-ink-2)] hover:underline">
        Forgot password?
      </button>
    </form>
  );
}

function ForgotForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-[var(--crm-ink-2)]">Enter your CRM email and we’ll send a link to set a new password.</p>
      <div>
        <label htmlFor="reset-email" className="crm-label">Email</label>
        <input id="reset-email" name="email" type="email" autoComplete="username" required defaultValue={email} className="crm-input" />
      </div>
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#5ee39a]">{state.ok}</p>}
      <button type="submit" disabled={pending} className="crm-btn crm-btn-primary w-full">{pending ? "Sending…" : "Send reset link"}</button>
      <button type="button" onClick={onBack} className="block w-full text-center text-xs text-[var(--crm-ink-2)] hover:underline">← Back to sign in</button>
    </form>
  );
}
