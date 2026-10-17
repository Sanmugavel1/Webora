"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="crm-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state?.email} className="crm-input" />
      </div>
      <div>
        <label htmlFor="password" className="crm-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="crm-input" />
      </div>
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      <button type="submit" disabled={pending} className="crm-btn crm-btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
