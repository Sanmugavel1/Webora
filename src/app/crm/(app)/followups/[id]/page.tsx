import { notFound } from "next/navigation";
import { requireUser } from "@/lib/crm/auth";
import { q, q1 } from "@/lib/crm/db";
import type { SequenceStep } from "@/lib/crm/config";
import { PageTitle } from "@/components/crm/ui";
import { SequenceEditor } from "@/components/crm/SequenceEditor";

export const metadata = { title: "Edit sequence" };

export default async function EditSequencePage({ params }: PageProps<"/crm/followups/[id]">) {
  await requireUser();
  const { id } = await params;
  const templates = await q<{ id: number; name: string; channel: string }>("SELECT id, name, channel FROM crm_templates ORDER BY name");
  let initial = { id: null as number | null, name: "", description: "", trigger: "new_lead", active: true, steps: [] as SequenceStep[] };
  if (id !== "new") {
    const s = await q1<typeof initial & { id: number }>("SELECT id, name, description, trigger, active, steps FROM crm_sequences WHERE id = $1", [Number(id) || 0]);
    if (!s) notFound();
    initial = s;
  } else {
    const wa = templates.find((t) => t.channel === "whatsapp");
    if (wa) initial.steps = [{ day: 0, channel: "whatsapp", templateId: wa.id }];
  }
  return (
    <>
      <PageTitle title={id === "new" ? "New follow-up sequence" : initial.name} sub="Choose when it starts and what goes out on which day." />
      <SequenceEditor initial={initial} templates={templates} />
    </>
  );
}
