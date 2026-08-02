import {
  isSecurityAuditPlanId,
  normalizeGitHubRepository,
  normalizeOptionalHttpsUrl,
  type SecurityAuditPlanId,
} from "../../../../lib/security-audit";
import { createPolarSecurityAuditCheckoutUrl } from "../../../../lib/polar";

export const runtime = "nodejs";

type Intake = {
  planId: SecurityAuditPlanId;
  email: string;
  company: string;
  repository: string;
  policyUrl: string;
  scopeNotes: string;
};

function redirectToIntake(request: Request, planId: string, status: string) {
  const url = new URL("/security-audit/intake", request.url);
  if (isSecurityAuditPlanId(planId)) url.searchParams.set("plan", planId);
  url.searchParams.set("status", status);
  return Response.redirect(url, 303);
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseIntake(formData: FormData): Intake {
  const planId = cleanText(formData.get("plan"), 32);
  if (!isSecurityAuditPlanId(planId)) throw new Error("Choose a valid audit plan.");

  const email = cleanText(formData.get("email"), 254).toLowerCase();
  if (!isValidEmail(email)) throw new Error("Enter a valid business email address.");

  const company = cleanText(formData.get("company"), 120);
  const repository = normalizeGitHubRepository(cleanText(formData.get("repository"), 300));
  const policyUrl = normalizeOptionalHttpsUrl(cleanText(formData.get("policyUrl"), 500));
  const scopeNotes = cleanText(formData.get("scopeNotes"), 500);
  if (formData.get("authorization") !== "confirmed") {
    throw new Error("Repository-owner or program authorization must be confirmed.");
  }
  if (formData.get("terms") !== "accepted") {
    throw new Error("The service terms must be accepted.");
  }

  return { planId, email, company, repository, policyUrl, scopeNotes };
}

function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return Response.json({ error: "Cross-origin checkout is not allowed." }, { status: 403 });
  }

  const formData = await request.formData();
  const requestedPlan = cleanText(formData.get("plan"), 32);
  if (cleanText(formData.get("website"), 200)) {
    return redirectToIntake(request, requestedPlan, "received");
  }

  let intake: Intake;
  try {
    intake = parseIntake(formData);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid audit request." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const orderReference = crypto.randomUUID();
    const checkoutUrl = createPolarSecurityAuditCheckoutUrl({
      orderReference,
      planId: intake.planId,
      email: intake.email,
      repository: intake.repository,
      company: intake.company,
      policyUrl: intake.policyUrl,
      scopeNotes: intake.scopeNotes,
    });
    return Response.redirect(checkoutUrl, 303);
  } catch (error) {
    console.error("Polar security audit checkout redirect failed", {
      plan: intake.planId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return redirectToIntake(request, intake.planId, "checkout-error");
  }
}
