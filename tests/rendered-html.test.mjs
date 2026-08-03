import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "text/html");

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...init,
      headers,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Unstash campaign page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /One tab/);
  assert.match(html, /Capture the current tab or import your Reddit saves/);
  assert.match(html, /Fund one useful upgrade/);
  assert.match(html, /From developer preview to cross-browser release/);
  assert.match(html, /500 USDT/);
  assert.match(html, /10,000 USDT/);
  assert.match(html, /Run the 5-minute test/);
  assert.match(html, /Install extension 0\.1/);
  assert.match(html, /See the private workflow in 29 seconds/);
  assert.match(html, /Prove one save can become one finished action/);
  assert.match(html, /Report what broke/);
  assert.match(html, /\/unstash-demo\.mp4/);
  assert.match(html, /synthetic voice/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the beta, prototype, extension and transparency pages", async () => {
  const [beta, betaRun, prototype, extension, transparency] = await Promise.all([
    render("/beta"),
    render("/beta/run"),
    render("/prototype"),
    render("/extension"),
    render("/transparency"),
  ]);
  assert.equal(beta.status, 200);
  assert.equal(betaRun.status, 200);
  assert.equal(prototype.status, 200);
  assert.equal(extension.status, 200);
  assert.equal(transparency.status, 200);

  const [betaHtml, betaRunHtml, prototypeHtml, extensionHtml, transparencyHtml] = await Promise.all([
    beta.text(),
    betaRun.text(),
    prototype.text(),
    extension.text(),
    transparency.text(),
  ]);
  assert.match(betaHtml, /Turn one forgotten save into one finished action/);
  assert.match(betaHtml, /Start with one real save/);
  assert.match(betaHtml, /\/beta\/run/);
  assert.match(betaRunHtml, /Use one real save\. Finish one real action/);
  assert.match(betaRunHtml, /Finish one save, then answer once/);
  assert.match(prototypeHtml, /Working local prototype/);
  assert.match(prototypeHtml, /Import Reddit saves without signing in/);
  assert.match(prototypeHtml, /SHIPPED · PERMISSION-FREE/);
  assert.match(prototypeHtml, /Add to queue/);
  assert.match(extensionHtml, /Save the tab\. Pick what happens next/);
  assert.match(extensionHtml, /Download extension 0\.1/);
  assert.match(extensionHtml, /activeTab/);
  assert.match(extensionHtml, /\/unstash-extension-v0\.1\.0\.zip/);
  assert.match(transparencyHtml, /Every contribution has a visible job/);
  assert.match(transparencyHtml, /Active milestone/);
  assert.match(transparencyHtml, /Cross-browser packaging/);
  assert.match(transparencyHtml, /Core product development/);
});

test("server-renders the paid repository audit funnel", async () => {
  const [landing, intake, success, terms, privacy, methodology, sampleReport] = await Promise.all([
    render("/security-audit"),
    render("/security-audit/intake?plan=standard"),
    render("/security-audit/success"),
    render("/security-audit/terms"),
    render("/security-audit/privacy"),
    render("/security-audit/methodology"),
    render("/security-audit/sample-report"),
  ]);

  for (const response of [landing, intake, success, terms, privacy, methodology, sampleReport]) {
    assert.equal(response.status, 200);
  }

  const [landingHtml, intakeHtml, successHtml, termsHtml, privacyHtml, methodologyHtml, sampleHtml] = await Promise.all([
    landing.text(),
    intake.text(),
    success.text(),
    terms.text(),
    privacy.text(),
    methodology.text(),
    sampleReport.text(),
  ]);

  assert.match(landingHtml, /Ship with fewer/);
  assert.match(landingHtml, /Book the \$490 audit/);
  assert.match(landingHtml, /Standard Repository Audit/);
  assert.match(landingHtml, /Managed Security Monitor/);
  assert.match(landingHtml, /Payment does not authorize testing/);
  assert.match(intakeHtml, /Confirm the repository and authorization/);
  assert.match(intakeHtml, /Standard Repository Audit/);
  assert.match(intakeHtml, /<strong>\$950<\/strong>/);
  assert.match(intakeHtml, /action="\/api\/security-audit\/checkout"/);
  assert.match(intakeHtml, /name="authorization"/);
  assert.match(intakeHtml, /name="terms"/);
  assert.match(successHtml, /Next: scope verification/);
  assert.match(termsHtml, /Payment is not authorization/);
  assert.match(privacyHtml, /does not receive the full card number/);
  assert.match(methodologyHtml, /Every finding must survive human review/);
  assert.match(sampleHtml, /Counterfeit token can inflate a public funding total/);
  assert.match(landingHtml, /LeadHarbor/);
  assert.match(landingHtml, /Inspect a sample finding/);
  assert.match(intakeHtml, /Payment is processed by Polar/);
  assert.doesNotMatch(landingHtml, /POLAR_WEBHOOK_SECRET|polar_(?:oat|pat)_/);
});

test("audit checkout rejects unauthorized or malformed submissions before Polar", async () => {
  const missingAuthorization = new URLSearchParams({
    plan: "beta",
    email: "owner@example.com",
    repository: "https://github.com/example/project",
    terms: "accepted",
  });
  const malformedRepository = new URLSearchParams({
    plan: "beta",
    email: "owner@example.com",
    repository: "https://example.com/not-github",
    authorization: "confirmed",
    terms: "accepted",
  });

  const [unauthorizedResponse, malformedResponse] = await Promise.all([
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: missingAuthorization,
    }),
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: malformedRepository,
    }),
  ]);

  assert.equal(unauthorizedResponse.status, 400);
  assert.equal(malformedResponse.status, 400);
  assert.match((await unauthorizedResponse.json()).error, /authorization/i);
  assert.match((await malformedResponse.json()).error, /github\.com/i);
});

test("authorized audit intake redirects to the server-mapped Polar checkout", async () => {
  const response = await render("/api/security-audit/checkout", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      plan: "beta",
      email: "owner@example.com",
      company: "Example Security",
      repository: "https://github.com/example/project",
      policyUrl: "https://example.com/security-policy",
      scopeNotes: "Default branch only",
      authorization: "confirmed",
      terms: "accepted",
    }),
    redirect: "manual",
  });

  assert.equal(response.status, 303);
  const checkout = new URL(response.headers.get("location"));
  assert.equal(checkout.origin, "https://buy.polar.sh");
  assert.equal(checkout.searchParams.get("product_id"), "e1398921-b9ff-4535-80bf-6e9621c2ea52");
  assert.equal(checkout.searchParams.get("customer_email"), "owner@example.com");
  assert.equal(
    checkout.searchParams.get("custom_field_data.github-repository"),
    "https://github.com/example/project",
  );
  assert.equal(checkout.searchParams.get("utm_content"), "authorization-confirmed");
  assert.equal(checkout.searchParams.get("custom_field_data.audit-scope"), null);
  assert.match(checkout.searchParams.get("reference_id"), /^[0-9a-f-]{36}$/i);
  assert.doesNotMatch(checkout.href, /POLAR_WEBHOOK_SECRET|polar_(?:oat|pat)_/i);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});

test("checkout enforces origin, media type and request-size boundaries", async () => {
  const [crossOrigin, wrongMediaType, oversized, oversizedWithoutLength] = await Promise.all([
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://attacker.example",
      },
      body: "plan=beta",
    }),
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": "20000",
      },
      body: "plan=beta",
    }),
    render("/api/security-audit/checkout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `plan=beta&company=${"x".repeat(20_000)}`,
    }),
  ]);

  assert.equal(crossOrigin.status, 403);
  assert.equal(wrongMediaType.status, 415);
  assert.equal(oversized.status, 413);
  assert.equal(oversizedWithoutLength.status, 413);
});

test("fulfillment readiness fails closed and reports only boolean checks", async () => {
  const original = {
    polar: process.env.POLAR_WEBHOOK_SECRET,
    url: process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL,
    secret: process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET,
  };

  try {
    delete process.env.POLAR_WEBHOOK_SECRET;
    delete process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL;
    delete process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET;
    const unavailable = await render("/api/security-audit/health", { headers: { accept: "application/json" } });
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
      service: "security-audit-fulfillment",
      ready: false,
      checks: { polarWebhook: false, fulfillmentConfiguration: false, queueReachable: false },
    });

    process.env.POLAR_WEBHOOK_SECRET = "whsec_test_secret_long_enough";
    process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL = "https://queue.example.test/orders";
    process.env.SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET = "0123456789abcdef0123456789abcdef";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://queue.example.test/orders");
      assert.equal(
        new Headers(init?.headers).get("authorization"),
        "Bearer 0123456789abcdef0123456789abcdef",
      );
      return Response.json({ ready: true });
    };
    try {
      const ready = await render("/api/security-audit/health", { headers: { accept: "application/json" } });
      assert.equal(ready.status, 200);
      assert.deepEqual(await ready.json(), {
        service: "security-audit-fulfillment",
        ready: true,
        checks: { polarWebhook: true, fulfillmentConfiguration: true, queueReachable: true },
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    for (const [key, value] of Object.entries({
      POLAR_WEBHOOK_SECRET: original.polar,
      SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL: original.url,
      SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET: original.secret,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("webhook rejects invalid signatures and oversized payloads without caching", async () => {
  const original = process.env.POLAR_WEBHOOK_SECRET;
  process.env.POLAR_WEBHOOK_SECRET = "whsec_dGVzdF90ZXN0X3Rlc3RfdGVzdA==";
  try {
    const [invalid, oversized, oversizedWithoutLength] = await Promise.all([
      render("/api/security-audit/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "order.paid" }),
      }),
      render("/api/security-audit/webhook", {
        method: "POST",
        headers: { "content-type": "application/json", "content-length": "1048577" },
        body: "{}",
      }),
      render("/api/security-audit/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: `"${"x".repeat(1_048_576)}"`,
      }),
    ]);
    assert.ok([400, 403].includes(invalid.status));
    assert.equal(invalid.headers.get("cache-control"), "no-store");
    assert.equal(oversized.status, 413);
    assert.equal(oversizedWithoutLength.status, 413);
  } finally {
    if (original === undefined) delete process.env.POLAR_WEBHOOK_SECRET;
    else process.env.POLAR_WEBHOOK_SECRET = original;
  }
});

test("Next deployment config defines the required browser security headers", async () => {
  const source = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  for (const header of [
    "Content-Security-Policy",
    "Permissions-Policy",
    "Referrer-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
  ]) {
    assert.match(source, new RegExp(header));
  }
  assert.match(source, /frame-ancestors 'none'/);
});

test("Supabase fulfillment queue is private, authenticated and idempotent", async () => {
  const [migration, edgeFunction, config] = await Promise.all([
    readFile(
      new URL("../supabase/migrations/20260803031149_security_audit_fulfillment_queue.sql", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../supabase/functions/security-audit-orders/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/config.toml", import.meta.url), "utf8"),
  ]);

  assert.match(migration, /create schema if not exists security_ops/i);
  assert.match(migration, /event_id text not null unique/i);
  assert.match(
    migration,
    /revoke all on schema security_ops from public, anon, authenticated, service_role/i,
  );
  assert.doesNotMatch(config, /schemas\s*=\s*\[[^\]]*security_ops/i);
  assert.match(config, /\[functions\.security-audit-orders\][\s\S]*verify_jwt = false/);
  assert.match(edgeFunction, /SECURITY_AUDIT_FULFILLMENT_SECRET/);
  assert.match(edgeFunction, /Idempotency key does not match the event/);
  assert.match(edgeFunction, /on conflict \(event_id\) do nothing/i);
  assert.match(edgeFunction, /SUPABASE_DB_URL/);
});
