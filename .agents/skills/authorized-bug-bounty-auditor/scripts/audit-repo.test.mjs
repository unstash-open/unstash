import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { runAudit } from "./audit-repo.mjs";

function git(cwd, args) {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

async function createFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "authorized-audit-test-"));
  const repo = path.join(root, "repo");
  const out = path.join(root, "out");
  await mkdir(path.join(repo, "src"), { recursive: true });
  await writeFile(path.join(repo, "src", "unsafe.js"), [
    "export function render(value) {",
    "  element.innerHTML = value;",
    "}",
    "const apiKey = 'abcdefghijklmnop123456';",
    "",
  ].join("\n"));
  await writeFile(path.join(repo, "package.json"), '{"name":"fixture","version":"1.0.0"}\n');
  git(repo, ["init"]);
  git(repo, ["config", "user.name", "Audit Test"]);
  git(repo, ["config", "user.email", "audit@example.invalid"]);
  git(repo, ["remote", "add", "origin", "git@github.com:example/fixture.git"]);
  git(repo, ["add", "."]);
  git(repo, ["commit", "-m", "fixture"]);
  const commit = git(repo, ["rev-parse", "HEAD"]);
  const scope = path.join(root, "scope.json");
  const now = new Date();
  await writeFile(scope, JSON.stringify({
    schemaVersion: 1,
    program: "Fixture program",
    policyUrl: "https://example.invalid/security",
    repository: "https://github.com/example/fixture",
    authorizationConfirmed: true,
    authorizationBasis: "Owned test fixture",
    policyCheckedAt: now.toISOString(),
    testedCommit: commit,
    testingWindow: {
      startsAt: new Date(now.getTime() - 60_000).toISOString(),
      endsAt: new Date(now.getTime() + 60_000).toISOString(),
    },
    allowedTechniques: ["offline source review"],
    prohibitedTechniques: ["production testing"],
  }, null, 2));
  return { repo, out, scope };
}

test("inventories files, emits redacted leads, and writes reports", async () => {
  const fixture = await createFixture();
  const result = await runAudit(fixture);
  assert.equal(result.inventory.totals.files, 2);
  assert.ok(result.leads.some((lead) => lead.rule === "code.raw-html"));
  const secret = result.leads.find((lead) => lead.rule === "secret.generic-assignment");
  assert.ok(secret);
  assert.match(secret.evidence, /^\[REDACTED sha256:[a-f0-9]{16}\]$/);
  assert.ok(!JSON.stringify(result.leads).includes("abcdefghijklmnop123456"));
  const summary = await readFile(path.join(fixture.out, "summary.md"), "utf8");
  assert.match(summary, /Scanner matches are leads/);
});

test("rejects a scope contract for the wrong repository", async () => {
  const fixture = await createFixture();
  const scope = JSON.parse(await readFile(fixture.scope, "utf8"));
  scope.repository = "https://github.com/example/not-the-fixture";
  await writeFile(fixture.scope, JSON.stringify(scope));
  await assert.rejects(() => runAudit(fixture), /scope repository does not match origin/);
});
