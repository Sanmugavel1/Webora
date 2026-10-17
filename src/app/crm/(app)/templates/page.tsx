import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { renderTemplate } from "@/lib/crm/template";
import { ChannelBadge, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Message formats" };

export default async function TemplatesPage() {
  await requireUser();
  const templates = await q<{ id: number; name: string; channel: string; subject: string; body: string; used: number }>(`
    SELECT t.*, (SELECT count(*)::int FROM crm_sequences s, jsonb_array_elements(s.steps) st WHERE (st->>'templateId')::int = t.id) AS used
    FROM crm_templates t ORDER BY t.channel DESC, t.name`);
  const sample = { name: "Arjun", business: "Spice Route Cafe", service: "Business Website" };
  return (
    <>
      <PageTitle
        title="Message formats"
        sub="Reusable WhatsApp and email messages. Personal details like {{first_name}} fill in automatically."
        actions={<Link href="/crm/templates/new" className="crm-btn crm-btn-primary">+ New format</Link>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Link key={t.id} href={`/crm/templates/${t.id}`} className="crm-card flex flex-col p-4 transition-colors hover:border-white/25">
            <div className="mb-2 flex items-center gap-2">
              <ChannelBadge channel={t.channel} />
              <span className="ml-auto text-[11px] text-[var(--crm-ink-3)]">{t.used ? `in ${t.used} sequence step${t.used === 1 ? "" : "s"}` : "not automated"}</span>
            </div>
            <p className="font-medium">{t.name}</p>
            {t.subject && <p className="truncate text-xs text-[var(--crm-ink-2)]">{renderTemplate(t.subject, sample)}</p>}
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-[var(--crm-ink-3)]">{renderTemplate(t.body, sample)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
