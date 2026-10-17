import "server-only";

export type LeadFilter = { q: string; stage: string; source: string; tag: string };

/** WHERE clause for the Leads list — shared by the page and "select all matching" bulk actions. */
export function leadWhere(f: LeadFilter) {
  const where: string[] = [];
  const params: unknown[] = [];
  const term = f.q.trim();
  if (term) {
    params.push(`%${term.toLowerCase()}%`);
    where.push(`(lower(l.name) LIKE $${params.length} OR lower(l.business) LIKE $${params.length} OR lower(l.email) LIKE $${params.length} OR l.phone LIKE $${params.length})`);
  }
  if (f.stage) { params.push(f.stage); where.push(`l.stage = $${params.length}`); }
  if (f.source) { params.push(f.source); where.push(`l.source = $${params.length}`); }
  if (f.tag) { params.push(f.tag); where.push(`$${params.length} = ANY(l.tags)`); }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}
