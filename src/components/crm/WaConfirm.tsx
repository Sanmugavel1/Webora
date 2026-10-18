"use client";

import { Check, PhoneOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Asked after WhatsApp opens. The CRM can't see whether the number is on
 * WhatsApp, so nothing is logged (and the lead stays "New") until the agent says.
 */
export function WaConfirm({ onSent, onNoWhatsapp, onCancel, busy, next, className }: {
  onSent: () => void;
  onNoWhatsapp: () => void;
  onCancel: () => void;
  busy?: boolean;
  next?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs text-[var(--crm-ink-2)]">Did the message go through?</span>
      <button disabled={busy} onClick={onSent} className="crm-btn crm-btn-wa crm-btn-sm"><Check className="h-3.5 w-3.5" /> Sent{next ? " & next" : ""}</button>
      <button disabled={busy} onClick={onNoWhatsapp} className="crm-btn crm-btn-danger crm-btn-sm" title="Tags the lead #no-whatsapp and skips its WhatsApp follow-ups"><PhoneOff className="h-3.5 w-3.5" /> Not on WhatsApp{next ? " & next" : ""}</button>
      <button disabled={busy} onClick={onCancel} className="crm-btn crm-btn-ghost crm-btn-sm"><X className="h-3.5 w-3.5" /> Not sent</button>
    </div>
  );
}
