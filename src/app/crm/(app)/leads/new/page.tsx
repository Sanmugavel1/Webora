import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { listUsers, requireUser } from "@/lib/crm/auth";
import { q1 } from "@/lib/crm/db";
import { Card, PageTitle } from "@/components/crm/ui";
import { LeadFields } from "@/components/crm/LeadFields";
import { createLeadAction } from "../../../actions";

export const metadata = { title: "Create lead" };

export default async function NewLeadPage({ searchParams }: PageProps<"/crm/leads/new">) {
  await requireUser();
  const added = Number((await searchParams).added) || 0;
  const [users, last] = await Promise.all([
    listUsers(),
    added ? q1<{ id: number; name: string }>("SELECT id, name FROM crm_leads WHERE id = $1", [added]) : undefined,
  ]);

  return (
    <>
      <PageTitle
        title="Create lead"
        sub="Add any lead by hand — a call, walk-in, Instagram DM, referral… New leads start your “new lead” follow-ups automatically."
        actions={<Link href="/crm/leads" className="crm-btn crm-btn-ghost">View all leads</Link>}
      />
      {last && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#17d4b8]/30 bg-[#17d4b8]/10 px-4 py-3 text-sm text-[#7af0dd]">
          <CheckCircle2 className="h-4 w-4" /> Saved <Link href={`/crm/leads/${last.id}`} className="font-semibold underline">{last.name}</Link>. Add the next one below.
        </p>
      )}
      <Card className="max-w-3xl">
        <form action={createLeadAction}>
          <LeadFields users={users} />
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button name="then" value="another" className="crm-btn crm-btn-ghost">Save &amp; add another</button>
            <button name="then" value="open" className="crm-btn crm-btn-primary">Save lead</button>
          </div>
        </form>
      </Card>
    </>
  );
}
