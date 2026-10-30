import { Badge } from "@/components/ui/badge";
import type { PayLine, PayStatement } from "@/lib/associatePay";

export const naira = (n: number) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const TYPE_LABEL: Record<string, string> = {
  procedure: "Procedure",
  lab_deduction: "Lab fee",
  guarantee_topup: "Guarantee",
};

export function StatementSummary({ s }: { s: PayStatement }) {
  const cells = [
    ["Gross production", naira(s.grossProduction)],
    ["Net (after discounts / unpaid)", naira(s.netProduction)],
    ["Commission earned", naira(s.commissionEarned)],
    ["Lab fee deductions", `− ${naira(s.labDeductions)}`],
    ["Guarantee top-up", naira(s.guaranteeTopUp)],
    ["Days worked", String(s.daysWorked)],
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cells.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <p className="text-[11px] text-muted-foreground">{k}</p>
            <p className="text-sm font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
        <span className="text-sm font-medium">Total payable</span>
        <span className="text-lg font-bold text-primary">{naira(s.totalPayable)}</span>
      </div>
    </div>
  );
}

export function StatementLines({ lines }: { lines: Pick<PayLine, "item_type" | "item_date" | "description" | "gross_amount" | "net_amount" | "earned_amount">[] }) {
  if (!lines.length) return <p className="py-6 text-center text-sm text-muted-foreground">No billed work in this period.</p>;
  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border border-border/50">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-muted/60">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Date</th>
            <th className="px-3 py-2 text-left font-medium">Item</th>
            <th className="px-3 py-2 text-right font-medium">Fee</th>
            <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">Net</th>
            <th className="px-3 py-2 text-right font-medium">Earned</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className="border-t border-border/30">
              <td className="px-3 py-2 font-mono text-muted-foreground">{l.item_date || "—"}</td>
              <td className="px-3 py-2">
                <Badge variant="outline" className="mr-2 text-[10px]">{TYPE_LABEL[l.item_type] || l.item_type}</Badge>
                {l.description}
              </td>
              <td className="px-3 py-2 text-right">{naira(l.gross_amount)}</td>
              <td className="px-3 py-2 text-right hidden sm:table-cell">{l.item_type === "procedure" ? naira(l.net_amount) : "—"}</td>
              <td className={`px-3 py-2 text-right font-semibold ${Number(l.earned_amount) < 0 ? "text-destructive" : ""}`}>{naira(l.earned_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
