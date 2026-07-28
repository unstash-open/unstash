import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createCaptureHash,
  decodeCaptureHash,
  normaliseCaptureUrl,
} from "../extension/capture.js";

test("round-trips a private extension capture with unicode text", () => {
  const hash = createCaptureHash({
    version: 1,
    url: "https://example.com/guide?step=1#notes",
    title: "A useful guide — сохранить",
    action: "make",
  });
  const decoded = decodeCaptureHash(hash);

  assert.equal(decoded.ok, true);
  if (!decoded.ok) return;
  assert.equal(decoded.capture.url, "https://example.com/guide?step=1#notes");
  assert.equal(decoded.capture.title, "A useful guide — сохранить");
  assert.equal(decoded.capture.action, "make");
});

test("rejects privileged, credentialed and malformed capture URLs", () => {
  assert.equal(normaliseCaptureUrl("chrome://extensions"), null);
  assert.equal(normaliseCaptureUrl("javascript:alert(1)"), null);
  assert.equal(normaliseCaptureUrl("https://user:pass@example.com"), null);
  assert.equal(decodeCaptureHash("#capture=not-json").ok, false);
});

test("ships a Manifest V3 extension with activeTab only", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../extension/manifest.json", import.meta.url),
      "utf8",
    ),
  );

  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["activeTab"]);
  assert.equal("host_permissions" in manifest, false);
  assert.equal(manifest.action.default_popup, "popup.html");
});
