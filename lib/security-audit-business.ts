import { PROJECT } from "./project";

const configuredContactEmail = process.env.NEXT_PUBLIC_SECURITY_AUDIT_CONTACT_EMAIL?.trim();

export const SECURITY_AUDIT_BUSINESS = {
  name: "LeadHarbor Studio",
  serviceName: "LeadHarbor Security Review",
  siteUrl: `${PROJECT.siteUrl}/security-audit`,
  contactEmail: configuredContactEmail ?? "",
  publicQuestionsUrl:
    `${PROJECT.sourceUrl}/issues/new?template=security-audit-question.yml`,
} as const;

export function getSecurityAuditContactHref() {
  if (SECURITY_AUDIT_BUSINESS.contactEmail) {
    return `mailto:${SECURITY_AUDIT_BUSINESS.contactEmail}?subject=Repository%20security%20review`;
  }
  return SECURITY_AUDIT_BUSINESS.publicQuestionsUrl;
}
