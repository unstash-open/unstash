import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Repository security review · LeadHarbor Studio",
    template: "%s · LeadHarbor Studio",
  },
  description:
    "Human-verified repository security reviews with explicit scope, local evidence and remediation guidance.",
};

export default function SecurityAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
