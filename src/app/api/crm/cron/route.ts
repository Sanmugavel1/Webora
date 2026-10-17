import { NextResponse } from "next/server";
import { runDueFollowups } from "@/lib/crm/engine";

/** Daily safety-net run (vercel.json). Follow-ups also run whenever the CRM is opened. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const processed = await runDueFollowups({ limit: 100 });
  return NextResponse.json({ ok: true, processed });
}
