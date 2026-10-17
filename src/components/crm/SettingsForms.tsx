"use client";

import { useActionState } from "react";
import { addUserAction, removeUserAction, updateProfileAction } from "@/app/crm/actions";

export function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-3">
      <label className="block"><span className="crm-label">Your name (used as {"{{agent}}"} in messages)</span><input name="name" defaultValue={name} className="crm-input" /></label>
      <label className="block"><span className="crm-label">New password (leave blank to keep)</span><input name="password" type="password" autoComplete="new-password" className="crm-input" /></label>
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
