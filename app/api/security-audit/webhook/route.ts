import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getSecurityAuditPlanIdForPolarProduct } from "../../../../lib/polar";
import {
  FulfillmentConfigurationError,
  getFulfillmentConfiguration,
} from "../../../../lib/security-audit-fulfillment";
import {
  readBoundedRequestBody,
  RequestBodyTooLargeError,
} from "../../../../lib/request-body";

export const runtime = "nodejs";

const MAX_WEBHOOK_BODY_BYTES = 1_048_576;

function jsonNoStore(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

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
  const { url, secret } = getFulfillmentConfiguration();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
      "Idempotency-Key": payload.eventId,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Fulfillment webhook responded with ${response.status}.`);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return jsonNoStore({ error: "Polar webhook is not configured." }, 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BODY_BYTES) {
    return jsonNoStore({ error: "Webhook payload is too large." }, 413);
  }

  let rawBody: string;
  try {
    const body = await readBoundedRequestBody(request, MAX_WEBHOOK_BODY_BYTES);
    rawBody = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonNoStore({ error: "Webhook payload is too large." }, 413);
    }
    return jsonNoStore({ error: "Invalid webhook encoding." }, 400);
  }
  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(rawBody, Object.fromEntries(request.headers.entries()), webhookSecret);
  } catch (error) {
    const status = error instanceof WebhookVerificationError ? 403 : 400;
    return jsonNoStore({ error: "Invalid Polar webhook." }, status);
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
        return jsonNoStore({ received: true, ignored: true });
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
      console.info("Security audit order event queued", {
        event: event.type,
        eventId,
        plan: planId,
        polarOrderId: order.id,
      });
    } else if (event.type === "subscription.revoked" || event.type === "subscription.past_due") {
      const subscription = event.data;
      const planId = getSecurityAuditPlanIdForPolarProduct(subscription.productId);
      if (!planId) return jsonNoStore({ received: true, ignored: true });

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
      console.info("Security audit subscription event queued", {
        event: event.type,
        eventId,
        plan: planId,
        polarSubscriptionId: subscription.id,
      });
    }
  } catch (error) {
    console.error("Security audit fulfillment notification failed", {
      eventId,
      error: error instanceof Error ? error.name : "UnknownError",
    });
    const status = error instanceof FulfillmentConfigurationError ? 503 : 502;
    return jsonNoStore({ error: "Fulfillment notification failed." }, status);
  }

  return jsonNoStore({ received: true });
}
