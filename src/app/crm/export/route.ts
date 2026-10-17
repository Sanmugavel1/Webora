import { currentUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { LEAD_SELECT, type Lead } from "@/lib/crm/engine";

const cell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join(", ") : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const leads = await q<Lead>(`${LEAD_SELECT} ORDER BY l.created_at DESC`);
  const cols = ["name", "business", "email", "phone", "service", "source", "stage", "value", "tags", "notes", "agent_name", "next_followup_at", "created_at"] as const;
  const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => cell(l[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="webora-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
