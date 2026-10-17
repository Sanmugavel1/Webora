"use client";

import { useTransition } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { cancelScheduledAction, dismissMessageAction, markMessageSentAction } from "@/app/crm/actions";
import { mailtoLink, waLink } from "@/lib/crm/template";

/** Opening the prepared WhatsApp/email counts as sending it — one tap per follow-up. */
export function OutboxSend({ id, channel, to, subject, body }: { id: number; channel: string; to: string; subject: string; body: string }) {
  const [pending, start] = useTransition();
  const href = channel === "email" ? mailtoLink(to, subject, body) : waLink(to, body);
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={href}
        target={channel === "email" ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={() => start(() => markMessageSentAction(id))}
        className={`crm-btn crm-btn-sm ${channel === "email" ? "crm-btn-primary" : "crm-btn-wa"}`}
        aria-disabled={pending}
      >
        {channel === "email" ? <Mail className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
        {channel === "email" ? "Send email" : "Send on WhatsApp"}
      </a>
      <button disabled={pending} onClick={() => start(() => dismissMessageAction(id))} className="crm-btn crm-btn-ghost crm-btn-sm">Skip</button>
    </div>
  );
}

export function CancelScheduled({ ids, label }: { ids: number[]; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => { if (ids.length > 1 && !confirm(`Cancel ${ids.length} scheduled emails?`)) return; start(() => cancelScheduledAction(ids)); }}
      className="crm-btn crm-btn-ghost crm-btn-sm"
    >
      {pending ? "Cancelling…" : label}
    </button>
  );
}
