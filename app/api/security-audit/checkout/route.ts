import { PROJECT } from "../../../../lib/project";
import {
  getSecurityAuditPlan,
  isSecurityAuditPlanId,
  normalizeGitHubRepository,
  normalizeOptionalHttpsUrl,
} from "../../../../lib/security-audit";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

type Intake = {
  planId: string;
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

function checkoutBaseUrl(request: Request) {
  const requestUrl = new URL(request.url);
  if (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1") {
    return requestUrl.origin;
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim() || PROJECT.siteUrl;
  const url = new URL(configured);
  if (!/^https?:$/.test(url.protocol)) throw new Error("NEXT_PUBLIC_APP_URL is invalid.");
  return url.origin;
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

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return redirectToIntake(request, intake.planId, "checkout-unavailable");
  }

  try {
    const stripe = getStripe();
    const plan = getSecurityAuditPlan(intake.planId);
    const orderReference = crypto.randomUUID();
    const baseUrl = checkoutBaseUrl(request);
    const metadata = {
      orderReference,
      plan: plan.id,
      repository: intake.repository,
      company: intake.company,
      policyUrl: intake.policyUrl,
      scopeNotes: intake.scopeNotes,
      authorizationConfirmed: "true",
    };

    const session = await stripe.checkout.sessions.create({
      mode: plan.billingMode,
      payment_method_types: ["card"],
      customer_email: intake.email,
      client_reference_id: orderReference,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            ...(plan.billingMode === "subscription"
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
        },
      ],
      metadata,
      ...(plan.billingMode === "subscription" ? { subscription_data: { metadata } } : {}),
      success_url: `${baseUrl}/security-audit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/security-audit/intake?plan=${plan.id}&status=cancelled`,
      custom_text: {
        submit: {
          message:
            "The audit begins only after scope is verified. Payment never authorizes production exploitation.",
        },
      },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Security audit checkout failed", {
      plan: intake.planId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return redirectToIntake(request, intake.planId, "checkout-error");
  }
}
