import "server-only";
import { q } from "./db";

export type DomainRow = { domain: string; leads: number; open: number; won: number; value: number };

/**
 * Every domain with its lead stats: domains that leads use, plus ones added by
 * hand on the Domains page that have no leads yet. "gym" and "Gym" are one
 * domain; the most common spelling is shown. Leads with no domain are left out.
 */
export function listDomains() {
  return q<DomainRow>(`
    WITH g AS (
      SELECT lower(trim(domain)) AS k, mode() WITHIN GROUP (ORDER BY trim(domain)) AS domain,
        count(*)::int AS leads,
        count(*) FILTER (WHERE stage NOT IN ('won', 'lost'))::int AS open,
        count(*) FILTER (WHERE stage = 'won')::int AS won,
        coalesce(sum(value), 0)::int AS value
      FROM crm_leads WHERE trim(domain) <> '' GROUP BY 1
    )
    SELECT coalesce(g.domain, d.name) AS domain, coalesce(g.leads, 0) AS leads, coalesce(g.open, 0) AS open,
      coalesce(g.won, 0) AS won, coalesce(g.value, 0) AS value
    FROM g FULL JOIN crm_domains d ON lower(d.name) = g.k
    ORDER BY leads DESC, domain`);
}

export async function domainNames() {
  return (await listDomains()).map((d) => d.domain).sort((a, b) => a.localeCompare(b));
}
