import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
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
  assert.match(html, /Try it in 30 seconds/);
  assert.match(html, /Install extension 0\.1/);
  assert.match(html, /See the private workflow in 29 seconds/);
  assert.match(html, /Five honest tests beat five thousand impressions/);
  assert.match(html, /Report what broke/);
  assert.match(html, /\/unstash-demo\.mp4/);
  assert.match(html, /synthetic voice/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the prototype, extension and transparency pages", async () => {
  const [prototype, extension, transparency] = await Promise.all([
    render("/prototype"),
    render("/extension"),
    render("/transparency"),
  ]);
  assert.equal(prototype.status, 200);
  assert.equal(extension.status, 200);
  assert.equal(transparency.status, 200);

  const [prototypeHtml, extensionHtml, transparencyHtml] = await Promise.all([
    prototype.text(),
    extension.text(),
    transparency.text(),
  ]);
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
