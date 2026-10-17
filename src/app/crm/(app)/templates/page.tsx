import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { domainNames } from "@/lib/crm/domains";
import { PageTitle } from "@/components/crm/ui";
import { TemplateGrid } from "@/components/crm/TemplateGrid";
import { cn } from "@/lib/utils";

export const metadata = { title: "Message formats" };

/** "?domain=general" shows formats for every domain; any other value one domain's own formats. */
const GENERAL = "general";

export default async function TemplatesPage({ searchParams }: PageProps<"/crm/templates">) {
  await requireUser();
  const raw = (await searchParams).domain;
  const domain = typeof raw === "string" ? raw : "";
  const [templates, domains] = await Promise.all([
    q<{ id: number; name: string; channel: string; subject: string; body: string; domain: string; used: number }>(
      `SELECT t.*, (SELECT count(*)::int FROM crm_sequences s, jsonb_array_elements(s.steps) st WHERE (st->>'templateId')::int = t.id) AS used
       FROM crm_templates t
       WHERE $1 = '' OR ($1 = '${GENERAL}' AND t.domain = '') OR lower(t.domain) = lower($1)
       ORDER BY lower(t.domain), t.channel DESC, t.name`,
      [domain],
    ),
    domainNames(),
  ]);
  const chip = (value: string, label: string) => (
    <Link
      key={value || "all"}
      href={value ? `/crm/templates?domain=${encodeURIComponent(value)}` : "/crm/templates"}
      className={cn("rounded-full border px-3 py-1 text-xs", domain.toLowerCase() === value.toLowerCase() ? "border-[var(--color-blue)] bg-[var(--color-blue)]/15 text-white" : "border-[var(--crm-line)] text-[var(--crm-ink-2)] hover:bg-white/5")}
    >
      {label}
    </Link>
  );
  const forDomain = domain && domain !== GENERAL ? domain : "";

  return (
    <>
      <PageTitle
        title="Message formats"
        sub="Reusable WhatsApp and email messages, for every domain or just one (e.g. Gym: welcome, follow-ups). Details like {{first_name}} fill in automatically."
        actions={
          <Link href={forDomain ? `/crm/templates/new?domain=${encodeURIComponent(forDomain)}` : "/crm/templates/new"} className="crm-btn crm-btn-primary">
            + New {forDomain ? `${forDomain} ` : ""}format
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {chip("", "All")}
        {chip(GENERAL, "All-domain formats")}
        {domains.map((d) => chip(d, d))}
      </div>
      {templates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--crm-line)] px-4 py-8 text-center text-sm text-[var(--crm-ink-3)]">
          No formats here yet —{" "}
          <Link href={forDomain ? `/crm/templates/new?domain=${encodeURIComponent(forDomain)}` : "/crm/templates/new"} className="underline">add one</Link>.
        </p>
      ) : (
        <TemplateGrid key={domain} templates={templates} />
      )}
    </>
  );
}
