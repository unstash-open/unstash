import postgres from "postgres";
import {
  authorize,
  readBoundedRequestText,
  RequestBodyTooLargeError,
  validPayload,
} from "./validation.ts";

const MAX_BODY_BYTES = 1_048_576;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function databaseClient() {
  const databaseUrl = Deno.env.get("SUPABASE_DB_URL")?.trim();
  if (!databaseUrl) return null;
  return postgres(databaseUrl, {
    max: 1,
    prepare: false,
    connect_timeout: 5,
    idle_timeout: 5,
  });
}

Deno.serve(async (request) => {
  if (!await authorize(request, Deno.env.get("SECURITY_AUDIT_FULFILLMENT_SECRET"))) {
    return json({ error: "Unauthorized." }, 401);
  }

  if (request.method === "GET") {
    const sql = databaseClient();
    if (!sql) return json({ ready: false }, 503);
    try {
      const [result] = await sql<{ ready: boolean }[]>`
        select to_regclass('security_ops.audit_order_events') is not null as ready
      `;
      return json({ ready: result?.ready === true }, result?.ready === true ? 200 : 503);
    } catch {
      return json({ ready: false }, 503);
    } finally {
      await sql.end({ timeout: 2 });
    }
  }

  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Expected application/json." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "Payload is too large." }, 413);
  }

  let rawBody: string;
  try {
    rawBody = await readBoundedRequestText(request, MAX_BODY_BYTES);
  } catch (error) {
    const status = error instanceof RequestBodyTooLargeError ? 413 : 400;
    return json({ error: status === 413 ? "Payload is too large." : "Invalid payload encoding." }, status);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  if (!validPayload(payload)) return json({ error: "Invalid order event." }, 400);
  if (request.headers.get("idempotency-key") !== payload.eventId) {
    return json({ error: "Idempotency key does not match the event." }, 400);
  }

  const sql = databaseClient();
  if (!sql) return json({ error: "Queue write failed." }, 503);
  try {
    const inserted = await sql<{ id: number }[]>`
      insert into security_ops.audit_order_events (
        event_id,
        event_type,
        event_created_at,
        polar_order_id,
        polar_subscription_id,
        polar_product_id,
        plan,
        payload
      ) values (
        ${payload.eventId},
        ${payload.eventType},
        ${payload.createdAt},
        ${payload.polarOrderId ?? null},
        ${payload.polarSubscriptionId ?? null},
        ${payload.polarProductId},
        ${payload.plan},
        ${sql.json(JSON.parse(rawBody))}
      )
      on conflict (event_id) do nothing
      returning id
    `;
    return json({ queued: true, duplicate: inserted.length === 0 }, inserted.length === 0 ? 200 : 201);
  } catch {
    return json({ error: "Queue write failed." }, 503);
  } finally {
    await sql.end({ timeout: 2 });
  }
});
