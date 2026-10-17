import { notFound } from "next/navigation";
import { requireUser } from "@/lib/crm/auth";
import { q1 } from "@/lib/crm/db";
import { PageTitle } from "@/components/crm/ui";
import { TemplateEditor } from "@/components/crm/TemplateEditor";

export const metadata = { title: "Edit message format" };

export default async function EditTemplatePage({ params }: PageProps<"/crm/templates/[id]">) {
  await requireUser();
  const { id } = await params;
  let initial = { id: null as number | null, name: "", channel: "whatsapp", subject: "", body: "Hi {{first_name}}, " };
  if (id !== "new") {
    const t = await q1<typeof initial & { id: number }>("SELECT id, name, channel, subject, body FROM crm_templates WHERE id = $1", [Number(id) || 0]);
    if (!t) notFound();
    initial = t;
  }
  return (
    <>
      <PageTitle title={id === "new" ? "New message format" : initial.name} />
      <TemplateEditor initial={initial} />
    </>
  );
}
