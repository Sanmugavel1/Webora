import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { SEED_SEQUENCES, SEED_TEMPLATES } from "./seed";

/**
 * Single shared pool per server instance. On Vercel each lambda keeps its own
 * pool, so keep it small — Neon's pooled endpoint does the real fan-in.
 * TLS comes from the connection string (`sslmode=require`).
 */
const globalForPg = globalThis as unknown as { crmPool?: Pool; crmSchema?: Promise<void> };

function pool() {
  if (!globalForPg.crmPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set — the CRM needs a Postgres database.");
    globalForPg.crmPool = new Pool({ connectionString, max: 3 });
  }
  return globalForPg.crmPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS crm_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  stage TEXT NOT NULL DEFAULT 'new',
  value INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT NOT NULL DEFAULT '',
  assigned_to INTEGER REFERENCES crm_users(id) ON DELETE SET NULL,
  next_followup_at TIMESTAMPTZ,
  lost_reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stage_changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_leads_stage_idx ON crm_leads(stage);
-- "Domain" = business type (Gym, Shoe store…). Added later; backfilled once when the column is created.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'crm_leads' AND column_name = 'domain') THEN
    ALTER TABLE crm_leads ADD COLUMN domain TEXT NOT NULL DEFAULT '';
    UPDATE crm_leads SET domain = CASE WHEN 'gym' = ANY(tags) THEN 'Gym' ELSE initcap(trim(business)) END;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS crm_leads_email_idx ON crm_leads(lower(email));
CREATE INDEX IF NOT EXISTS crm_leads_phone_idx ON crm_leads(phone);

CREATE TABLE IF NOT EXISTS crm_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES crm_users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_activities_lead_idx ON crm_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS crm_activities_recent_idx ON crm_activities(created_at DESC);

CREATE TABLE IF NOT EXISTS crm_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_sequences (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  trigger TEXT NOT NULL DEFAULT 'manual',
  active BOOLEAN NOT NULL DEFAULT true,
  steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_enrollments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  sequence_id INTEGER NOT NULL REFERENCES crm_sequences(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_run_at TIMESTAMPTZ,
  stopped_reason TEXT NOT NULL DEFAULT '',
  UNIQUE (lead_id, sequence_id)
);
CREATE INDEX IF NOT EXISTS crm_enrollments_due_idx ON crm_enrollments(status, next_run_at);

CREATE TABLE IF NOT EXISTS crm_messages (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  enrollment_id INTEGER REFERENCES crm_enrollments(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  to_addr TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS crm_messages_status_idx ON crm_messages(status, created_at DESC);
-- Emails scheduled from the Leads page wait here (status 'scheduled') until scheduled_for.
ALTER TABLE crm_messages ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS crm_messages_lead_idx ON crm_messages(lead_id);
CREATE INDEX IF NOT EXISTS crm_messages_scheduled_idx ON crm_messages(scheduled_for) WHERE status = 'scheduled';

CREATE TABLE IF NOT EXISTS crm_tasks (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES crm_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function seed(client: PoolClient) {
  const { rows } = await client.query<{ n: number }>("SELECT count(*)::int AS n FROM crm_templates");
  if (rows[0].n > 0) return;
  const ids: Record<string, number> = {};
  for (const t of SEED_TEMPLATES) {
    const r = await client.query<{ id: number }>(
      "INSERT INTO crm_templates (name, channel, subject, body) VALUES ($1,$2,$3,$4) RETURNING id",
      [t.name, t.channel, t.subject ?? "", t.body],
    );
    ids[t.key] = r.rows[0].id;
  }
  for (const s of SEED_SEQUENCES) {
    const steps = s.steps.map((step) => ({ day: step.day, channel: step.channel, templateId: ids[step.template] }));
    await client.query(
      "INSERT INTO crm_sequences (name, description, trigger, active, steps) VALUES ($1,$2,$3,$4,$5)",
      [s.name, s.description, s.trigger, s.active, JSON.stringify(steps)],
    );
  }
}

/** Creates tables + starter templates/sequences on first use (idempotent). */
function ensureSchema() {
  if (!globalForPg.crmSchema) {
    globalForPg.crmSchema = (async () => {
      const client = await pool().connect();
      // Transaction-scoped lock: a session lock leaks through Neon's pooler
      // (unlock can land on a different backend) and then blocks every cold start.
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(424243)");
        await client.query(SCHEMA);
        await seed(client);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    })().catch((err) => {
      globalForPg.crmSchema = undefined;
      throw err;
    });
  }
  return globalForPg.crmSchema;
}

export async function q<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function q1<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const rows = await q<T>(text, params);
  return rows[0] as T | undefined;
}

export async function tx<T>(fn: (client: PoolClient) => Promise<T>) {
  await ensureSchema();
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
