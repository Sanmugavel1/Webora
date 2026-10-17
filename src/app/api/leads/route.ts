import { NextResponse, after } from "next/server";
import { createOrMergeLead, runDueFollowups } from "@/lib/crm/engine";
import { channelStatus, sendEmail } from "@/lib/crm/messaging";
import { CONTACT_EMAIL } from "@/lib/constants";
import { PUBLIC_SITE_URL } from "@/lib/crm/config";

interface LeadBody {
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  message?: string;
  /** Honeypot — real visitors never see or fill this. */
  website?: string;
}

const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Public endpoint behind the website contact form — every enquiry lands in the CRM. */
export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ ok: true });

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const phone = clip(body.phone, 30);
  const message = clip(body.message, 4000);
  if (!name || (!email && !phone)) {
    return NextResponse.json({ error: "Please share your name and an email or phone number." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const { id, created } = await createOrMergeLead(
    { name, email, phone, business: clip(body.businessName, 160), service: clip(body.projectType, 80), source: "website", notes: message },
    { message },
  );

  after(async () => {
    await runDueFollowups({ leadId: id });
    if (channelStatus().email) {
      await sendEmail(
        CONTACT_EMAIL,
        `${created ? "New" : "Repeat"} enquiry: ${name}${body.businessName ? ` (${clip(body.businessName, 160)})` : ""}`,
        [
          `Name: ${name}`,
          `Business: ${clip(body.businessName, 160) || "-"}`,
          `Email: ${email || "-"}`,
          `Phone: ${phone || "-"}`,
          `Looking for: ${clip(body.projectType, 80) || "-"}`,
          "",
          message || "-",
          "",
          `Open in CRM: ${PUBLIC_SITE_URL}/crm/leads/${id}`,
        ].join("\n"),
      ).catch((e) => console.error("lead notify email failed", e));
    }
  });

  return NextResponse.json({ ok: true });
}
