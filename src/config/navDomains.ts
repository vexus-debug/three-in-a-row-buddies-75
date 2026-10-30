import {
  CalendarDays, Users, Stethoscope, Microscope, CreditCard, Package,
  BarChart3, Settings,
} from "lucide-react";
import { hasPageAccess } from "@/config/roleAccess";

/**
 * Dental navigation consolidation: 30+ sidebar links collapse into 8 hub
 * domains. Each hub keeps one primary page in the sidebar; the other screens
 * in the domain are reached through the tab bar rendered above the page
 * (see components/dashboard/HubTabs.tsx). Every old URL stays a real route,
 * so no redirects or broken bookmarks.
 */
export interface HubTab {
  title: string;
  path: string;
}

export interface HubDomain {
  key: string;
  title: string;
  icon: any;
  primaryPath: string;
  tabs: HubTab[];
}

export const DENTAL_HUBS: HubDomain[] = [
  {
    key: "schedule",
    title: "Schedule",
    icon: CalendarDays,
    primaryPath: "appointments",
    tabs: [
      { title: "Appointments", path: "appointments" },
      { title: "Staff Schedules", path: "schedules" },
      { title: "Waiting List", path: "waiting-list" },
    ],
  },
  {
    key: "patients",
    title: "Patients",
    icon: Users,
    primaryPath: "patients",
    tabs: [
      { title: "Patient List", path: "patients" },
      { title: "Feedback", path: "reviews" },
    ],
  },
  {
    key: "clinical",
    title: "Clinical",
    icon: Stethoscope,
    primaryPath: "dental-charts",
    tabs: [
      { title: "Dental Charts", path: "dental-charts" },
      { title: "Treatments", path: "treatments" },
      { title: "Prescriptions", path: "prescriptions" },
      { title: "Consent Forms", path: "consent-forms" },
    ],
  },
  {
    key: "lab",
    title: "Lab",
    icon: Microscope,
    primaryPath: "lab",
    tabs: [
      { title: "Lab Dashboard", path: "lab" },
      { title: "Lab Cases", path: "lab/cases" },
      { title: "Work Orders", path: "lab-work" },
      { title: "Technicians", path: "lab/technicians" },
      { title: "Lab Billing", path: "lab/billing" },
    ],
  },
  {
    key: "billing",
    title: "Billing",
    icon: CreditCard,
    primaryPath: "billing",
    tabs: [
      { title: "Invoices & Payments", path: "billing" },
      { title: "Estimates", path: "estimates" },
      { title: "Payment Plans", path: "payment-plans" },
      { title: "Expenses", path: "expenses" },
      { title: "My Earnings", path: "my-earnings" },
    ],
  },
  {
    key: "inventory",
    title: "Inventory",
    icon: Package,
    primaryPath: "inventory",
    tabs: [
      { title: "Stock", path: "inventory" },
      { title: "Material Costs", path: "inventory-costs" },
      { title: "Treatment Materials", path: "treatment-materials" },
      { title: "Suppliers", path: "suppliers" },
      { title: "Purchase Orders", path: "purchase-orders" },
    ],
  },
  {
    key: "insights",
    title: "Insights",
    icon: BarChart3,
    primaryPath: "reports",
    tabs: [
      { title: "Reports", path: "reports" },
      { title: "Advanced Analytics", path: "analytics" },
      { title: "Commissions", path: "commissions" },
      { title: "Profitability", path: "profitability" },
      { title: "Revenue Allocation", path: "revenue-allocation" },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    icon: Settings,
    primaryPath: "settings",
    tabs: [
      { title: "Practice Settings", path: "settings" },
      { title: "Staff", path: "staff" },
      { title: "Documents", path: "documents" },
      { title: "Audit Log", path: "audit-log" },
      { title: "Lab Settings", path: "lab/settings" },
      { title: "Website Settings", path: "website-settings" },
      { title: "Shop Management", path: "shop-management" },
      { title: "Automation", path: "automation" },
    ],
  },
];

function pathMatchesTab(relativePath: string, tabPath: string): boolean {
  // Exact matches, plus patient profile sub-routes (patients/:id).
  return relativePath === tabPath || (tabPath === "patients" && relativePath.startsWith("patients/"));
}

export function getHubForPath(relativePath: string): HubDomain | undefined {
  return DENTAL_HUBS.find((hub) => hub.tabs.some((tab) => pathMatchesTab(relativePath, tab.path)));
}

export function hubIsActive(hub: HubDomain, relativePath: string): boolean {
  return hub.tabs.some((tab) => pathMatchesTab(relativePath, tab.path));
}

export function visibleHubTabs(hub: HubDomain, orgRole: string, clinicType?: string, isBranch?: boolean): HubTab[] {
  return hub.tabs.filter(
    (tab) =>
      hasPageAccess(orgRole, tab.path, clinicType) &&
      !(isBranch && (tab.path === "website-settings" || tab.path === "shop-management"))
  );
}

/** Hubs the role can open, each trimmed to its visible tabs. */
export function visibleHubs(orgRole: string, clinicType?: string, isBranch?: boolean) {
  return DENTAL_HUBS.map((hub) => ({ hub, tabs: visibleHubTabs(hub, orgRole, clinicType, isBranch) }))
    .filter(({ tabs }) => tabs.length > 0);
}
