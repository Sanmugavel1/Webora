"use client";

import { useTransition } from "react";
import { deleteSequenceAction, toggleSequenceAction } from "@/app/crm/actions";

export function SequenceToggle({ id, active }: { id: number; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <button disabled={pending} onClick={() => start(() => toggleSequenceAction(id, !active))} className="crm-btn crm-btn-ghost crm-btn-sm">
        {active ? "Pause" : "Turn on"}
      </button>
      <button
        disabled={pending}
        onClick={() => { if (confirm("Delete this sequence? Leads in it stop receiving its messages.")) start(() => deleteSequenceAction(id)); }}
        className="crm-btn crm-btn-danger crm-btn-sm"
      >
        Delete
      </button>
    </div>
  );
}
