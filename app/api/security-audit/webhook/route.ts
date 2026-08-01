import type Stripe from "stripe";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

type FulfillmentPayload = {
  eventId: string;
  eventType: string;
  createdAt: string;
  orderReference?: string | null;
  stripeSessionId?: string;
  stripeCustomerId?: string | null;
  plan?: string;
  repository?: string;
  company?: string;
  customerEmail?: string | null;
  policyUrl?: string;
  scopeNotes?: string;
  authorizationConfirmed?: boolean;
  paymentStatus?: string;
  amountTotal?: number | null;
  currency?: string | null;
};

function objectId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function notifyFulfillment(payload: FulfillmentPayload) {
  const target = process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL?.trim();
  if (!target) {
    console.warn("Paid security audit is visible in Stripe, but fulfillment webhook is not configured", {
      eventId: payload.eventId,
      stripeSessionId: payload.stripeSessionId,
    });
    return;
  }

  const url = new URL(target);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("Fulfillment webhook must use HTTPS.");
  }

  const secret = process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET?.trim();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      "Idempotency-Key": payload.eventId,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Fulfillment webhook responded with ${response.status}.`);
  }
}

function checkoutPayload(event: Stripe.Event, session: Stripe.Checkout.Session): FulfillmentPayload {
  const metadata = session.metadata ?? {};
  return {
    eventId: event.id,
    eventType: event.type,
    createdAt: new Date(event.created * 1000).toISOString(),
    orderReference: session.client_reference_id,
    stripeSessionId: session.id,
    stripeCustomerId: objectId(session.customer),
    plan: metadata.plan,
    repository: metadata.repository,
    company: metadata.company,
    customerEmail: session.customer_details?.email ?? session.customer_email,
    policyUrl: metadata.policyUrl,
    scopeNotes: metadata.scopeNotes,
    authorizationConfirmed: metadata.authorizationConfirmed === "true",
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
  };
}

function subscriptionPayload(event: Stripe.Event, subscription: Stripe.Subscription): FulfillmentPayload {
  return {
    eventId: event.id,
    eventType: event.type,
    createdAt: new Date(event.created * 1000).toISOString(),
    orderReference: subscription.metadata.orderReference,
    stripeCustomerId: objectId(subscription.customer),
    plan: subscription.metadata.plan,
    repository: subscription.metadata.repository,
    company: subscription.metadata.company,
    policyUrl: subscription.metadata.policyUrl,
    scopeNotes: subscription.metadata.scopeNotes,
    authorizationConfirmed: subscription.metadata.authorizationConfirmed === "true",
  };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY?.trim()) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await notifyFulfillment(checkoutPayload(event, event.data.object));
    } else if (event.type === "customer.subscription.deleted") {
      await notifyFulfillment(subscriptionPayload(event, event.data.object));
    }
  } catch (error) {
    console.error("Security audit fulfillment notification failed", {
      eventId: event.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Fulfillment notification failed." }, { status: 502 });
  }

  return Response.json(
    { received: true },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
