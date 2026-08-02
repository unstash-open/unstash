import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getSecurityAuditPlanIdForPolarProduct } from "../../../../lib/polar";

export const runtime = "nodejs";

type FulfillmentPayload = {
  eventId: string;
  eventType: string;
  createdAt: string;
  orderReference?: string;
  polarOrderId?: string;
  polarCheckoutId?: string | null;
  polarCustomerId?: string;
  polarSubscriptionId?: string | null;
  polarProductId: string;
  plan: string;
  productName?: string;
  repository?: string;
  company?: string | null;
  customerEmail?: string | null;
  scopeNotes?: string;
  authorizationConfirmed: boolean;
  paymentStatus?: string;
  amountTotal?: number;
  currency?: string;
};

function fieldString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

async function notifyFulfillment(payload: FulfillmentPayload) {
  const target = process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL?.trim();
  if (!target) {
    console.warn("Paid security audit is visible in Polar, but fulfillment webhook is not configured", {
      eventId: payload.eventId,
      polarOrderId: payload.polarOrderId,
      plan: payload.plan,
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

  if (!response.ok) throw new Error(`Fulfillment webhook responded with ${response.status}.`);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return Response.json({ error: "Polar webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(rawBody, Object.fromEntries(request.headers.entries()), webhookSecret);
  } catch (error) {
    const status = error instanceof WebhookVerificationError ? 403 : 400;
    return Response.json({ error: "Invalid Polar webhook." }, { status });
  }

  const eventId = request.headers.get("webhook-id")
    ?? `${event.type}:${event.data.id}:${event.timestamp.toISOString()}`;

  try {
    if (event.type === "order.paid" || event.type === "order.refunded") {
      const order = event.data;
      const planId = order.productId
        ? getSecurityAuditPlanIdForPolarProduct(order.productId)
        : undefined;
      if (!planId || !order.productId) {
        return Response.json({ received: true, ignored: true });
      }

      await notifyFulfillment({
        eventId,
        eventType: event.type,
        createdAt: event.timestamp.toISOString(),
        orderReference: fieldString(order.metadata.reference_id),
        polarOrderId: order.id,
        polarCheckoutId: order.checkoutId,
        polarCustomerId: order.customerId,
        polarSubscriptionId: order.subscriptionId,
        polarProductId: order.productId,
        plan: planId,
        productName: order.product?.name,
        repository: fieldString(order.customFieldData?.["github-repository"]),
        company: order.customer.name,
        customerEmail: order.customer.email,
        scopeNotes: fieldString(order.customFieldData?.["audit-scope"]),
        authorizationConfirmed:
          fieldString(order.metadata.utm_content) === "authorization-confirmed",
        paymentStatus: String(order.status),
        amountTotal: order.totalAmount,
        currency: order.currency,
      });
    } else if (event.type === "subscription.revoked" || event.type === "subscription.past_due") {
      const subscription = event.data;
      const planId = getSecurityAuditPlanIdForPolarProduct(subscription.productId);
      if (!planId) return Response.json({ received: true, ignored: true });

      await notifyFulfillment({
        eventId,
        eventType: event.type,
        createdAt: event.timestamp.toISOString(),
        orderReference: fieldString(subscription.metadata.reference_id),
        polarCheckoutId: subscription.checkoutId,
        polarCustomerId: subscription.customerId,
        polarSubscriptionId: subscription.id,
        polarProductId: subscription.productId,
        plan: planId,
        productName: subscription.product.name,
        repository: fieldString(subscription.customFieldData?.["github-repository"]),
        company: subscription.customer.name,
        customerEmail: subscription.customer.email,
        scopeNotes: fieldString(subscription.customFieldData?.["audit-scope"]),
        authorizationConfirmed:
          fieldString(subscription.metadata.utm_content) === "authorization-confirmed",
        paymentStatus: String(subscription.status),
        amountTotal: subscription.amount,
        currency: subscription.currency,
      });
    }
  } catch (error) {
    console.error("Security audit fulfillment notification failed", {
      eventId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Fulfillment notification failed." }, { status: 502 });
  }

  return Response.json(
    { received: true },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
