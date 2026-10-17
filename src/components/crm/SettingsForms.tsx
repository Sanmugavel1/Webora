"use client";

import { useActionState, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { addUserAction, changePasswordAction, removeUserAction, setMemberPasswordAction, updateProfileAction } from "@/app/crm/actions";

/** Password box with a show/hide eye, so typing on a phone is easy to check. */
export function PasswordInput({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="crm-label">{label}</span>
      <span className="relative block">
        <input name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required className="crm-input pr-10" />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-ink-3)] hover:text-[var(--crm-ink)]">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

export function ChangePasswordForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Awaited<ReturnType<typeof changePasswordAction>>, fd: FormData) => {
    const r = await changePasswordAction(prev, fd);
    if (r?.ok) form.current?.reset();
    return r;
  }, null);
  return (
    <form ref={form} action={action} className="space-y-3">
      <PasswordInput name="current_password" label="Current password" autoComplete="current-password" />
      <PasswordInput name="new_password" label="New password (at least 8 characters)" autoComplete="new-password" />
      <PasswordInput name="confirm_password" label="Type the new password again" autoComplete="new-password" />
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#5ee39a]">{state.ok}</p>}
      <button disabled={pending} className="crm-btn crm-btn-primary">{pending ? "Changing…" : "Change password"}</button>
    </form>
  );
}

export function SetMemberPassword({ id, name }: { id: number; name: string }) {
  return (
    <button
      onClick={async () => {
        const pw = prompt(`New password for ${name} (at least 8 characters):`);
        if (!pw) return;
        const r = await setMemberPasswordAction(id, pw);
        alert(r.error || `Password for ${name} changed. Share it with them privately.`);
      }}
      className="crm-btn crm-btn-ghost crm-btn-sm"
    >
      Set password
    </button>
  );
}

export function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block"><span className="crm-label">Your name (used as {"{{agent}}"} in messages)</span><input name="name" defaultValue={name} className="crm-input" /></label>
      {state?.error && <p className="text-sm text-rose-300">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#5ee39a]">{state.ok}</p>}
      <button disabled={pending} className="crm-btn crm-btn-primary">Save</button>
    </form>
  );
}

export function AddUserForm() {
  const [state, action, pending] = useActionState(addUserAction, null);
  return (
    <form action={action} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <input name="name" placeholder="Name" required className="crm-input" aria-label="Name" />
      <input name="email" type="email" placeholder="Email" required className="crm-input" aria-label="Email" />
      <input name="password" type="password" placeholder="Temporary password" required minLength={8} className="crm-input" aria-label="Temporary password" />
      <button disabled={pending} className="crm-btn crm-btn-ghost">Add</button>
      {state?.error && <p className="text-sm text-rose-300 sm:col-span-4">{state.error}</p>}
      {state?.ok && <p className="text-sm text-[#5ee39a] sm:col-span-4">{state.ok}</p>}
    </form>
  );
}

export function RemoveUser({ id, name }: { id: number; name: string }) {
  return (
    <button onClick={() => { if (confirm(`Remove ${name}'s access?`)) removeUserAction(id); }} className="crm-btn crm-btn-ghost crm-btn-sm">Remove</button>
  );
}
