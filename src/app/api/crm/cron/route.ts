import { NextResponse } from "next/server";
import { runDueFollowups, runScheduledEmails } from "@/lib/crm/engine";

export const maxDuration = 60;

/** Scheduled safety-net runs (vercel.json). Automation also runs whenever the CRM is opened. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deadline = Date.now() + 50_000;
  const emails = await runScheduledEmails({ deadline });
  const processed = await runDueFollowups({ limit: 50, deadline });
  return NextResponse.json({ ok: true, processed, emails });
}
