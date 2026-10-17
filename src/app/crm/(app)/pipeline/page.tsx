import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { LEAD_SELECT, type Lead } from "@/lib/crm/engine";
import { PageTitle } from "@/components/crm/ui";
import { Kanban } from "@/components/crm/Kanban";
import Link from "next/link";

export const metadata = { title: "Pipeline" };

const PER_COLUMN = 50;

export default async function PipelinePage() {
  await requireUser();
  // Closed columns only show the last 60 days so the board stays readable.
  // Each column renders its top cards only; the rest are a click away in the Leads list,
  // so a big import can't turn the board into thousands of DOM nodes.
  const scope = `l.stage NOT IN ('won','lost') OR l.stage_changed_at > now() - interval '60 days'`;
  const [leads, stats] = await Promise.all([
    q<Lead>(
      `SELECT * FROM (
         ${LEAD_SELECT.replace("SELECT l.*,", "SELECT l.*, row_number() OVER (PARTITION BY l.stage ORDER BY l.value DESC, l.updated_at DESC) AS rn,")}
         WHERE ${scope}
       ) x WHERE rn <= ${PER_COLUMN} ORDER BY value DESC, updated_at DESC`,
    ),
    q<{ stage: string; n: number; total: number }>(
      `SELECT stage, count(*)::int AS n, coalesce(sum(value), 0)::bigint::float8 AS total FROM crm_leads l WHERE ${scope} GROUP BY stage`,
    ),
  ]);
  return (
    <>
      <PageTitle
        title="Pipeline"
        sub="Drag a card to move it. Moving past Contacted stops the nurture sequence; Proposal and Won start their own follow-ups."
        actions={<Link href="/crm/leads/new" className="crm-btn crm-btn-primary">+ Create lead</Link>}
      />
      <Kanban
        leads={leads.map((l) => ({
          id: l.id, name: l.name, business: l.business, service: l.service, value: l.value, stage: l.stage, agent_name: l.agent_name,
          stage_changed_at: new Date(l.stage_changed_at).toISOString(),
          next_followup_at: l.next_followup_at ? new Date(l.next_followup_at).toISOString() : null,
        }))}
        stats={Object.fromEntries(stats.map((x) => [x.stage, { n: x.n, total: x.total }]))}
      />
    </>
  );
}
