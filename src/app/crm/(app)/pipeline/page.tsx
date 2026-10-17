import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { LEAD_SELECT, type Lead } from "@/lib/crm/engine";
import { PageTitle } from "@/components/crm/ui";
import { Kanban } from "@/components/crm/Kanban";
import Link from "next/link";

export const metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  await requireUser();
  // Closed columns only show the last 60 days so the board stays readable.
  const leads = await q<Lead>(
    `${LEAD_SELECT} WHERE l.stage NOT IN ('won','lost') OR l.stage_changed_at > now() - interval '60 days' ORDER BY l.value DESC, l.updated_at DESC`,
  );
  return (
    <>
      <PageTitle
        title="Pipeline"
        sub="Drag a card to move it. Moving past Contacted stops the nurture sequence; Proposal and Won start their own follow-ups."
        actions={<Link href="/crm/leads?new=1" className="crm-btn crm-btn-primary">+ Add lead</Link>}
      />
      <Kanban
        leads={leads.map((l) => ({
          id: l.id, name: l.name, business: l.business, service: l.service, value: l.value, stage: l.stage, agent_name: l.agent_name,
          stage_changed_at: new Date(l.stage_changed_at).toISOString(),
          next_followup_at: l.next_followup_at ? new Date(l.next_followup_at).toISOString() : null,
        }))}
      />
    </>
  );
}
