import { getFulfillmentConfiguration } from "../../../../lib/security-audit-fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configured(value: string | undefined, minimumLength = 1) {
  return Boolean(value?.trim() && value.trim().length >= minimumLength);
}

export async function GET() {
  let fulfillmentConfiguration = false;
  let queueReachable = false;

  try {
    const { url, secret } = getFulfillmentConfiguration();
    fulfillmentConfiguration = true;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
      const body = await response.json() as { ready?: unknown };
      queueReachable = body.ready === true;
    }
  } catch {
    queueReachable = false;
  }

  const checks = {
    polarWebhook: configured(process.env.POLAR_WEBHOOK_SECRET, 16),
    fulfillmentConfiguration,
    queueReachable,
  };
  const ready = Object.values(checks).every(Boolean);

  return Response.json(
    { service: "security-audit-fulfillment", ready, checks },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
