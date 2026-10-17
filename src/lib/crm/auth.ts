import "server-only";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { q, q1 } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "webora_crm";
const SESSION_DAYS = 30;

export type CrmUser = { id: number; name: string; email: string; role: string };

function secret() {
  const s = process.env.CRM_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("CRM_SESSION_SECRET must be set (32+ chars).");
  return s;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [, saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function makeToken(userId: number) {
  const payload = `${userId}.${Date.now() + SESSION_DAYS * 86_400_000}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(parts[1]) < Date.now()) return null;
  return Number(parts[0]);
}

/**
 * The very first login creates the owner account from CRM_ADMIN_EMAIL /
 * CRM_ADMIN_PASSWORD. After that, accounts live in the database and the env
 * password is no longer accepted.
 */
async function bootstrapOwner(email: string, password: string) {
  const count = await q1<{ n: number }>("SELECT count(*)::int AS n FROM crm_users");
  if (!count || count.n > 0) return null;
  const envEmail = process.env.CRM_ADMIN_EMAIL?.trim().toLowerCase();
  const envPass = process.env.CRM_ADMIN_PASSWORD;
  if (!envEmail || !envPass || email !== envEmail) return null;
  const a = Buffer.from(password);
  const b = Buffer.from(envPass);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return q1<CrmUser>(
    "INSERT INTO crm_users (name, email, password_hash, role) VALUES ($1,$2,$3,'owner') RETURNING id, name, email, role",
    ["WEBORA", envEmail, await hashPassword(password)],
  );
}

export async function login(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  let user: CrmUser | null | undefined = null;
  const row = await q1<CrmUser & { password_hash: string }>(
    "SELECT id, name, email, role, password_hash FROM crm_users WHERE email = $1",
    [email],
  );
  if (row && (await verifyPassword(password, row.password_hash))) user = row;
  if (!user && !row) user = await bootstrapOwner(email, password);
  if (!user) return false;

  const jar = await cookies();
  jar.set(SESSION_COOKIE, makeToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<CrmUser | null> {
  const id = readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return (await q1<CrmUser>("SELECT id, name, email, role FROM crm_users WHERE id = $1", [id])) ?? null;
}

/** Use at the top of every CRM page, server action and API route. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/crm/login");
  return user;
}

export async function listUsers() {
  return q<CrmUser & { created_at: Date }>("SELECT id, name, email, role, created_at FROM crm_users ORDER BY id");
}
