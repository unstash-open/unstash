import {
  isSecurityAuditPlanId,
  normalizeGitHubRepository,
  type SecurityAuditPlanId,
} from "../../../../lib/security-audit";
import { createPolarSecurityAuditCheckoutUrl } from "../../../../lib/polar";
import {
  readBoundedRequestBody,
  RequestBodyTooLargeError,
} from "../../../../lib/request-body";

export const runtime = "nodejs";

type Intake = {
  planId: SecurityAuditPlanId;
  email: string;
  company: string;
  repository: string;
};

const MAX_CHECKOUT_BODY_BYTES = 16_384;

function noStoreRedirect(location: URL, status = 303) {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Location: location.toString(),
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function redirectToIntake(request: Request, planId: string, status: string) {
  const url = new URL("/security-audit/intake", request.url);
  if (isSecurityAuditPlanId(planId)) url.searchParams.set("plan", planId);
  url.searchParams.set("status", status);
  return noStoreRedirect(url);
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
  if (formData.get("authorization") !== "confirmed") {
    throw new Error("Repository-owner or program authorization must be confirmed.");
  }
  if (formData.get("terms") !== "accepted") {
    throw new Error("The service terms must be accepted.");
  }

  return { planId, email, company, repository };
}

function requestIsSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) {
    return Response.json({ error: "Cross-origin checkout is not allowed." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (
    !contentType.startsWith("application/x-www-form-urlencoded") &&
    !contentType.startsWith("multipart/form-data")
  ) {
    return Response.json(
      { error: "Unsupported checkout request." },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_CHECKOUT_BODY_BYTES) {
    return Response.json(
      { error: "Checkout request is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let formData: FormData;
  try {
    const body = await readBoundedRequestBody(request, MAX_CHECKOUT_BODY_BYTES);
    formData = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    }).formData();
  } catch (error) {
    const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
    return Response.json(
      { error: status === 413 ? "Checkout request is too large." : "Invalid checkout request." },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
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
    });
    console.info("Security audit checkout started", {
      event: "security_audit_checkout_started",
      referenceId: orderReference,
      plan: intake.planId,
    });
    return noStoreRedirect(checkoutUrl);
  } catch (error) {
    console.error("Polar security audit checkout redirect failed", {
      plan: intake.planId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return redirectToIntake(request, intake.planId, "checkout-error");
  }
}
