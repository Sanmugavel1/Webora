import { SOURCES } from "@/lib/crm/config";
import { PROJECT_TYPES } from "@/lib/data/contact";

type Defaults = Partial<{ name: string; business: string; email: string; phone: string; service: string; source: string; value: number; tags: string[]; notes: string; assigned_to: number | null }>;

/** Shared field set for the "new lead" and "edit lead" forms. */
export function LeadFields({ d = {}, users }: { d?: Defaults; users: { id: number; name: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <F label="Name *"><input name="name" required defaultValue={d.name} className="crm-input" /></F>
      <F label="Business"><input name="business" defaultValue={d.business} className="crm-input" /></F>
      <F label="Phone / WhatsApp"><input name="phone" type="tel" defaultValue={d.phone} placeholder="98765 43210" className="crm-input" /></F>
      <F label="Email"><input name="email" type="email" defaultValue={d.email} className="crm-input" /></F>
      <F label="Service">
        <input name="service" list="crm-services" defaultValue={d.service} className="crm-input" />
        <datalist id="crm-services">{PROJECT_TYPES.map((p) => <option key={p} value={p} />)}</datalist>
      </F>
      <F label="Source">
        <select name="source" defaultValue={d.source ?? "manual"} className="crm-input">
          {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </F>
      <F label="Deal value (₹)"><input name="value" inputMode="numeric" defaultValue={d.value || ""} placeholder="10999" className="crm-input" /></F>
      <F label="Owner">
        <select name="assigned_to" defaultValue={d.assigned_to ?? ""} className="crm-input">
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </F>
      <F label="Tags (comma separated)" className="sm:col-span-2"><input name="tags" defaultValue={d.tags?.join(", ")} placeholder="hot, restaurant, kochi" className="crm-input" /></F>
      <F label="Notes" className="sm:col-span-2"><textarea name="notes" rows={3} defaultValue={d.notes} className="crm-input resize-y" /></F>
    </div>
  );
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="crm-label">{label}</span>
      {children}
    </label>
  );
}
