import type { SecurityAuditPlanId } from "./security-audit";

export const POLAR_SECURITY_AUDIT_CHECKOUT_URL =
  "https://buy.polar.sh/polar_cl_TsRenZlIUwklWbamRFldnBMQPQo2fallM3dEh1gOmIv";

export const POLAR_SECURITY_AUDIT_PRODUCT_IDS: Record<SecurityAuditPlanId, string> = {
  beta: "e1398921-b9ff-4535-80bf-6e9621c2ea52",
  standard: "2debba8a-bb9f-4328-9424-e3e1e500b431",
  managed: "3ca07261-b6d1-4c0e-a9f3-516420c3c201",
};

type PolarCheckoutDetails = {
  planId: SecurityAuditPlanId;
  email: string;
  company: string;
  repository: string;
  policyUrl: string;
  scopeNotes: string;
  orderReference: string;
};

export function getSecurityAuditPlanIdForPolarProduct(productId: string) {
  return (Object.entries(POLAR_SECURITY_AUDIT_PRODUCT_IDS) as Array<[SecurityAuditPlanId, string]>)
    .find(([, configuredProductId]) => configuredProductId === productId)?.[0];
}

export function createPolarSecurityAuditCheckoutUrl(details: PolarCheckoutDetails) {
  const url = new URL(POLAR_SECURITY_AUDIT_CHECKOUT_URL);
  const scopeSummary = [
    details.policyUrl ? `Policy: ${details.policyUrl}` : "",
    details.scopeNotes ? `Scope: ${details.scopeNotes}` : "",
  ].filter(Boolean).join(" | ").slice(0, 500);

  url.searchParams.set("product_id", POLAR_SECURITY_AUDIT_PRODUCT_IDS[details.planId]);
  url.searchParams.set("customer_email", details.email);
  if (details.company) url.searchParams.set("customer_name", details.company);
  url.searchParams.set("reference_id", details.orderReference);
  url.searchParams.set("custom_field_data.github-repository", details.repository);
  if (scopeSummary) url.searchParams.set("custom_field_data.audit-scope", scopeSummary);
  url.searchParams.set("utm_source", "unstash");
  url.searchParams.set("utm_medium", "security-audit-intake");
  url.searchParams.set("utm_campaign", "repository-security-audit");
  url.searchParams.set("utm_content", "authorization-confirmed");
  url.searchParams.set("theme", "light");
  return url;
}
