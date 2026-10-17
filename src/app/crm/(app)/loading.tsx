/** Instant placeholder while a CRM page loads, so navigation never looks frozen. */
export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="mb-6 h-8 w-48 rounded-lg bg-white/5" />
      <div className="mb-4 h-12 rounded-xl bg-white/5" />
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.04]" />)}
      </div>
    </div>
  );
}
