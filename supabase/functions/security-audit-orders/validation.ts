const ALLOWED_EVENTS = new Set([
  "order.paid",
  "order.refunded",
  "subscription.past_due",
  "subscription.revoked",
]);
const ALLOWED_PLANS = new Set(["beta", "standard", "managed"]);

export type OrderEvent = {
  eventId: string;
  eventType: string;
  createdAt: string;
  polarOrderId?: string;
  polarSubscriptionId?: string | null;
  polarProductId: string;
  plan: string;
  [key: string]: unknown;
};

export class RequestBodyTooLargeError extends Error {}

export async function readBoundedRequestText(request: Request, maximumBytes: number) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        throw new RequestBodyTooLargeError(`Request body exceeds ${maximumBytes} bytes.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}

export async function safeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export function authorize(request: Request, configuredSecret?: string) {
  const secret = configuredSecret?.trim();
  if (!secret || secret.length < 32) return false;
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice(7), secret);
}

function validString(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

export function validPayload(value: unknown): value is OrderEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Partial<OrderEvent>;
  return (
    validString(payload.eventId, 512)
    && validString(payload.eventType, 64)
    && ALLOWED_EVENTS.has(payload.eventType)
    && validString(payload.createdAt, 64)
    && !Number.isNaN(Date.parse(payload.createdAt))
    && validString(payload.polarProductId, 36)
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.polarProductId)
    && validString(payload.plan, 32)
    && ALLOWED_PLANS.has(payload.plan)
  );
}
