// Pure associate-dentist pay calculator. Shared by the payroll screen and the
// dentist's own earnings screen so both always show the same numbers.

export type CompensationBasis = "production" | "collections";

export interface AssociateContract {
  compensation_basis: CompensationBasis;
  commission_rate: number; // % of net fee
  lab_fee_share: number; // % of lab fees the dentist carries
  daily_minimum: number; // guaranteed earnings per working day
}

export interface ProducedLine {
  id: string;
  invoice_id: string;
  invoice_date: string;
  patient_id: string | null;
  description: string;
  line_total: number;
  invoice_subtotal: number;
  invoice_discount: number;
  invoice_total: number;
  invoice_paid: number;
}

export interface LabCharge {
  id: string;
  date: string;
  patient_id: string | null;
  description: string;
  lab_fee: number;
}

export interface PayLine {
  item_type: "procedure" | "lab_deduction" | "guarantee_topup";
  source_id: string | null;
  patient_id: string | null;
  item_date: string | null;
  description: string;
  gross_amount: number;
  deduction_amount: number;
  net_amount: number;
  commission_rate: number;
  earned_amount: number;
}

export interface PayStatement {
  lines: PayLine[];
  grossProduction: number;
  netProduction: number;
  commissionEarned: number;
  labDeductions: number;
  daysWorked: number;
  guaranteeTopUp: number;
  totalPayable: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calculatePayStatement(
  contract: AssociateContract,
  produced: ProducedLine[],
  labs: LabCharge[],
): PayStatement {
  const rate = contract.commission_rate;
  const lines: PayLine[] = [];
  let gross = 0, net = 0, earned = 0, labDed = 0;
  const days = new Set<string>();

  for (const l of produced) {
    const g = Number(l.line_total) || 0;
    const discountShare = l.invoice_subtotal > 0 ? (g / l.invoice_subtotal) * (Number(l.invoice_discount) || 0) : 0;
    let n = g - discountShare;
    if (contract.compensation_basis === "collections") {
      const ratio = l.invoice_total > 0 ? Math.min(1, Math.max(0, l.invoice_paid / l.invoice_total)) : 0;
      n = n * ratio;
    }
    n = r2(n);
    const e = r2((n * rate) / 100);
    gross += g; net += n; earned += e;
    days.add(l.invoice_date);
    lines.push({
      item_type: "procedure", source_id: l.id, patient_id: l.patient_id, item_date: l.invoice_date,
      description: l.description, gross_amount: r2(g), deduction_amount: r2(g - n), net_amount: n,
      commission_rate: rate, earned_amount: e,
    });
  }

  for (const lab of labs) {
    const fee = Number(lab.lab_fee) || 0;
    const d = r2((fee * contract.lab_fee_share) / 100);
    if (d <= 0) continue;
    labDed += d;
    lines.push({
      item_type: "lab_deduction", source_id: lab.id, patient_id: lab.patient_id, item_date: lab.date,
      description: `Lab fee share: ${lab.description}`, gross_amount: r2(fee), deduction_amount: d,
      net_amount: 0, commission_rate: contract.lab_fee_share, earned_amount: -d,
    });
  }

  const afterLabs = r2(earned - labDed);
  const guaranteed = r2(contract.daily_minimum * days.size);
  const topUp = guaranteed > afterLabs ? r2(guaranteed - afterLabs) : 0;
  if (topUp > 0) {
    lines.push({
      item_type: "guarantee_topup", source_id: null, patient_id: null, item_date: null,
      description: `Daily minimum top-up (${days.size} day${days.size === 1 ? "" : "s"})`,
      gross_amount: guaranteed, deduction_amount: 0, net_amount: 0, commission_rate: 0, earned_amount: topUp,
    });
  }

  return {
    lines,
    grossProduction: r2(gross),
    netProduction: r2(net),
    commissionEarned: r2(earned),
    labDeductions: r2(labDed),
    daysWorked: days.size,
    guaranteeTopUp: topUp,
    totalPayable: r2(afterLabs + topUp),
  };
}
