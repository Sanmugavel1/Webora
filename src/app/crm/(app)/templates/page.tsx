import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { PageTitle } from "@/components/crm/ui";
import { TemplateGrid } from "@/components/crm/TemplateGrid";

export const metadata = { title: "Message formats" };

export default async function TemplatesPage() {
  await requireUser();
  const templates = await q<{ id: number; name: string; channel: string; subject: string; body: string; used: number }>(`
    SELECT t.*, (SELECT count(*)::int FROM crm_sequences s, jsonb_array_elements(s.steps) st WHERE (st->>'templateId')::int = t.id) AS used
    FROM crm_templates t ORDER BY t.channel DESC, t.name`);
  return (
    <>
      <PageTitle
        title="Message formats"
        sub="Reusable WhatsApp and email messages. Personal details like {{first_name}} fill in automatically."
        actions={<Link href="/crm/templates/new" className="crm-btn crm-btn-primary">+ New format</Link>}
      />
      <TemplateGrid templates={templates} />
    </>
  );
}
