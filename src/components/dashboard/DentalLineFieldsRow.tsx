import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DentalLineFields } from "@/hooks/useInvoices";

export const CLINICAL_PROVIDER_ROLES = ["dentist", "hygienist", "doctor", "specialist", "orthodontist", "surgeon"];
const SURFACES = ["M", "O", "D", "B", "L", "F", "I"];

interface Props {
  value: DentalLineFields;
  onChange: (v: DentalLineFields) => void;
  providers: { id: string; full_name: string; role?: string }[];
  className?: string;
}

/** Optional tooth / surface / CDT / provider details for one bill line. Leave blank for retail items. */
export function DentalLineFieldsRow({ value, onChange, providers, className }: Props) {
  const surfaces = (value.surfaces || "").toUpperCase();
  const toggle = (s: string) => {
    const next = surfaces.includes(s) ? surfaces.replace(s, "") : SURFACES.filter((x) => surfaces.includes(x) || x === s).join("");
    onChange({ ...value, surfaces: next });
  };
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-[80px_auto_100px_1fr] gap-2 items-center rounded-md border border-dashed border-border/70 bg-muted/20 p-2", className)}>
      <Input
        aria-label="Tooth number"
        placeholder="Tooth #"
        className="h-8 text-xs"
        maxLength={4}
        value={value.tooth_number || ""}
        onChange={(e) => onChange({ ...value, tooth_number: e.target.value.replace(/[^0-9A-Ta-t]/g, "") })}
      />
      <div className="flex gap-0.5" role="group" aria-label="Surfaces">
        {SURFACES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            aria-pressed={surfaces.includes(s)}
            className={cn(
              "h-8 w-6 rounded text-[11px] font-semibold border transition-colors",
              surfaces.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <Input
        aria-label="CDT code"
        placeholder="CDT e.g. D2391"
        className="h-8 text-xs font-mono uppercase"
        maxLength={6}
        value={value.cdt_code || ""}
        onChange={(e) => onChange({ ...value, cdt_code: e.target.value.toUpperCase() })}
      />
      <Select value={value.provider_id || "none"} onValueChange={(v) => onChange({ ...value, provider_id: v === "none" ? null : v })}>
        <SelectTrigger className="h-8 text-xs" aria-label="Treating provider"><SelectValue placeholder="Treating provider" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No provider</SelectItem>
          {providers.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.full_name}{p.role ? ` · ${p.role}` : ""}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Short label like "#14 · MOD · D2391". Empty string when nothing dental is set. */
export function dentalSummary(li: DentalLineFields, providerName?: string) {
  return [li.tooth_number && `#${li.tooth_number}`, li.surfaces, li.cdt_code, providerName].filter(Boolean).join(" · ");
}
