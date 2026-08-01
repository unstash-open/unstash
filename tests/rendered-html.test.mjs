import assert from "node:assert/strict";
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
  const [landing, intake, success, terms, privacy] = await Promise.all([
    render("/security-audit"),
    render("/security-audit/intake?plan=standard"),
    render("/security-audit/success"),
    render("/security-audit/terms"),
    render("/security-audit/privacy"),
  ]);

  for (const response of [landing, intake, success, terms, privacy]) {
    assert.equal(response.status, 200);
  }

  const [landingHtml, intakeHtml, successHtml, termsHtml, privacyHtml] = await Promise.all([
    landing.text(),
    intake.text(),
    success.text(),
    terms.text(),
    privacy.text(),
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
  assert.doesNotMatch(landingHtml, /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|sk_(?:test|live)_/);
});

test("audit checkout rejects unauthorized or malformed submissions before Stripe", async () => {
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
