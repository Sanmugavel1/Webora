import { CheckCircle2, Circle } from "lucide-react";
import { listUsers, requireUser } from "@/lib/crm/auth";
import { channelStatus } from "@/lib/crm/messaging";
import { Card, PageTitle } from "@/components/crm/ui";
import { AddUserForm, ProfileForm, RemoveUser } from "@/components/crm/SettingsForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const users = await listUsers();
  const ch = channelStatus();

  return (
    <>
      <PageTitle title="Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your profile">
          <ProfileForm name={user.name} />
        </Card>

        <Card title="Team">
          <ul className="mb-4 divide-y divide-[var(--crm-line)]">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{u.name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{u.name}{u.id === user.id && " (you)"}</span>
                  <span className="block truncate text-xs text-[var(--crm-ink-3)]">{u.email} · {u.role}</span>
                </span>
                {user.role === "owner" && u.role !== "owner" && <RemoveUser id={u.id} name={u.name} />}
              </li>
            ))}
          </ul>
          {user.role === "owner" ? <AddUserForm /> : <p className="text-xs text-[var(--crm-ink-3)]">Only the owner account can add people.</p>}
        </Card>

        <Card title="Channels" className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            <Channel
              ok
              title="Website enquiries → CRM"
              body="Every contact-form submission on the site becomes a lead instantly, duplicates are merged by phone/email, and the “new lead” sequence starts."
            />
            <Channel
              ok={ch.email}
              title="Email (Gmail)"
              body={ch.email
                ? "Connected — follow-up emails send by themselves, and you get an email for every new website enquiry."
                : "Not connected — emails wait in the Outbox. To send automatically: turn on 2-Step Verification for webora99@gmail.com, create an App Password, and add SMTP_USER + SMTP_PASS in Vercel."}
            />
            <Channel
              ok={ch.whatsappApi}
              title="WhatsApp"
              body={ch.whatsappApi
                ? "Cloud API connected — messages inside Meta's 24-hour reply window send by themselves; anything else lands in the Outbox."
                : "One-tap mode — due WhatsApp follow-ups appear in the Outbox with the message pre-filled; tap and send from your phone. Optional: add WHATSAPP_TOKEN + WHATSAPP_PHONE_ID (Meta Cloud API) for direct sending."}
            />
          </div>
          <p className="mt-4 text-xs text-[var(--crm-ink-3)]">
            Follow-ups are checked every time anyone opens the CRM, instantly when a new lead arrives, and once a day at 9 AM as a backup.
          </p>
        </Card>
      </div>
    </>
  );
}

function Channel({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--crm-line)] p-4">
      <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
        {ok ? <CheckCircle2 className="h-4 w-4 text-[#5ee39a]" /> : <Circle className="h-4 w-4 text-[var(--crm-ink-3)]" />}
        {title}
      </p>
      <p className="text-xs leading-relaxed text-[var(--crm-ink-2)]">{body}</p>
    </div>
  );
}
