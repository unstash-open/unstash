export const SECURITY_AUDIT_PLANS = {
  beta: {
    id: "beta",
    name: "Beta Repository Audit",
    shortName: "Beta audit",
    priceCents: 49_000,
    priceLabel: "$490",
    cadenceLabel: "one time",
    billingMode: "payment",
    turnaround: "3 business days",
    description:
      "A fixed-scope review for one GitHub repository with human triage and a decision-ready report.",
    deliverables: [
      "Authorization and scope contract",
      "Repository-wide inventory and deterministic scan",
      "Human validation of the strongest leads",
      "One redacted report and a 45-minute review call",
    ],
  },
  standard: {
    id: "standard",
    name: "Standard Repository Audit",
    shortName: "Standard audit",
    priceCents: 95_000,
    priceLabel: "$950",
    cadenceLabel: "one time",
    billingMode: "payment",
    turnaround: "5 business days",
    description:
      "A deeper release review with regression-test guidance and one verification pass after remediation.",
    deliverables: [
      "Everything in the beta audit",
      "Attack-surface and trust-boundary map",
      "Local reproduction for confirmed findings",
      "Regression-test guidance and one retest",
    ],
  },
  managed: {
    id: "managed",
    name: "Managed Security Monitor",
    shortName: "Managed monitor",
    priceCents: 49_900,
    priceLabel: "$499",
    cadenceLabel: "per month",
    billingMode: "subscription",
    turnaround: "monthly review",
    description:
      "Continuous release and pull-request triage with a monthly human-reviewed security brief.",
    deliverables: [
      "One active GitHub repository",
      "Release and pull-request security triage",
      "Monthly human-reviewed report",
      "Remediation review with a two-business-day response target",
    ],
  },
} as const;

export type SecurityAuditPlanId = keyof typeof SECURITY_AUDIT_PLANS;
export type SecurityAuditPlan = (typeof SECURITY_AUDIT_PLANS)[SecurityAuditPlanId];

export const DEFAULT_SECURITY_AUDIT_PLAN: SecurityAuditPlanId = "beta";

export function isSecurityAuditPlanId(value: unknown): value is SecurityAuditPlanId {
  return typeof value === "string" && value in SECURITY_AUDIT_PLANS;
}

export function getSecurityAuditPlan(value: unknown): SecurityAuditPlan {
  return SECURITY_AUDIT_PLANS[
    isSecurityAuditPlanId(value) ? value : DEFAULT_SECURITY_AUDIT_PLAN
  ];
}

export function normalizeGitHubRepository(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    throw new Error("Use an HTTPS github.com repository URL.");
  }

  const segments = url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.trim());
  if (segments.length !== 2 || segments.some((segment) => !/^[A-Za-z0-9_.-]+$/.test(segment))) {
    throw new Error("Use a repository URL in the form https://github.com/owner/repository.");
  }

  const repository = segments[1].replace(/\.git$/i, "");
  if (!repository) throw new Error("The repository name is missing.");
  return `https://github.com/${segments[0]}/${repository}`;
}

export function normalizeOptionalHttpsUrl(value: string) {
  if (!value.trim()) return "";
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Policy URLs must use HTTPS.");
  url.hash = "";
  return url.toString();
}
