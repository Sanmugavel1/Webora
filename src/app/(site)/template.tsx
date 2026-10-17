/**
 * Re-mounts on every route change (unlike layout.tsx), so each page gets a
 * short fade/lift entrance when navigating between Home, Pricing, etc.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
