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
  assert.match(html, /Saved/);
  assert.match(html, /Unstash turns forgotten saved posts/);
  assert.match(html, /Fund one useful upgrade/);
  assert.match(html, /Reddit import prototype/);
  assert.match(html, /500 USDT/);
  assert.match(html, /10,000 USDT/);
  assert.match(html, /Try the working prototype/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the prototype and transparency pages", async () => {
  const [prototype, transparency] = await Promise.all([
    render("/prototype"),
    render("/transparency"),
  ]);
  assert.equal(prototype.status, 200);
  assert.equal(transparency.status, 200);

  const [prototypeHtml, transparencyHtml] = await Promise.all([
    prototype.text(),
    transparency.text(),
  ]);
  assert.match(prototypeHtml, /Working local prototype/);
  assert.match(prototypeHtml, /Add to queue/);
  assert.match(transparencyHtml, /Every contribution has a visible job/);
  assert.match(transparencyHtml, /Active milestone/);
  assert.match(transparencyHtml, /Extension scaffold/);
  assert.match(transparencyHtml, /Core product development/);
});
