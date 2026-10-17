/** Display helpers — all dates shown in India time. */
const TZ = "Asia/Kolkata";

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function fmtDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function timeAgo(d: Date | string) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(d);
}

/** Value for <input type="datetime-local"> in IST. */
export function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const ist = new Date(new Date(d).getTime() + 5.5 * 3600_000);
  return ist.toISOString().slice(0, 16);
}
