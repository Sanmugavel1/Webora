"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { cancelScheduledAction, dismissMessageAction, markMessageSentAction, noWhatsappAction } from "@/app/crm/actions";
import { mailtoLink, waLink } from "@/lib/crm/template";
import { WaConfirm } from "./WaConfirm";

/**
 * Opening the prepared email counts as sending it. WhatsApp asks first, since
 * the number may not be on WhatsApp — that answer tags the lead instead.
 */
export function OutboxSend({ id, channel, to, subject, body }: { id: number; channel: string; to: string; subject: string; body: string }) {
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const href = channel === "email" ? mailtoLink(to, subject, body) : waLink(to, body);
  if (asking) {
    return (
      <WaConfirm
        busy={pending}
        onSent={() => start(() => markMessageSentAction(id))}
        onNoWhatsapp={() => start(() => noWhatsappAction({ messageId: id }))}
        onCancel={() => setAsking(false)}
      />
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={href}
        target={channel === "email" ? undefined : "_blank"}
        rel="noopener noreferrer"
        onClick={() => (channel === "email" ? start(() => markMessageSentAction(id)) : setAsking(true))}
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
