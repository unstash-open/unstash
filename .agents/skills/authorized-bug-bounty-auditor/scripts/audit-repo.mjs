#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const MAX_SNIPPET_CHARS = 180;
const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".hg",
  ".svn",
  ".next",
  ".nuxt",
  ".turbo",
  ".venv",
  "__pycache__",
  "bower_components",
  "coverage",
  "dist",
  "node_modules",
  "target",
]);

const MANIFEST_NAMES = new Set([
  "Cargo.lock",
  "Cargo.toml",
  "Gemfile",
  "Gemfile.lock",
  "go.mod",
  "go.sum",
  "mix.exs",
  "mix.lock",
  "package-lock.json",
  "package.json",
  "Pipfile",
  "Pipfile.lock",
  "pnpm-lock.yaml",
  "poetry.lock",
  "pom.xml",
  "pyproject.toml",
  "requirements.txt",
  "settings.gradle",
  "yarn.lock",
]);

const SENSITIVE_PATH_PATTERN = /(^|\/)(\.env($|\.)|\.github\/workflows|auth|crypto|deploy|docker|iam|middleware|permission|policy|security|session|terraform|token)/i;

const SECRET_RULES = [
  {
    id: "secret.private-key",
    description: "Private-key material",
    regex: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/,
  },
  {
    id: "secret.github-token",
    description: "GitHub token-shaped value",
    regex: /\b(?:gh[opusr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{30,255})\b/,
  },
  {
    id: "secret.aws-access-key",
    description: "AWS access-key-shaped value",
    regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    id: "secret.slack-token",
    description: "Slack token-shaped value",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,255}\b/,
  },
  {
    id: "secret.generic-assignment",
    description: "Hard-coded credential assignment",
    regex: /(?:api[_-]?key|client[_-]?secret|password|private[_-]?token)\s*[:=]\s*["']([^"'\s]{16,})["']/i,
    capture: 1,
  },
];

const CODE_RULES = [
  {
    id: "code.dynamic-eval",
    category: "unsafe-interpretation",
    description: "Dynamic evaluation; trace whether attacker-controlled text reaches it",
    regex: /\b(?:eval|exec)\s*\(/,
    extensions: new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py", ".rb", ".php"]),
  },
  {
    id: "code.js-new-function",
    category: "unsafe-interpretation",
    description: "JavaScript Function constructor",
    regex: /\bnew\s+Function\s*\(/,
    extensions: new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]),
  },
  {
    id: "code.shell-execution",
    category: "command-injection",
    description: "Shell/process execution; trace arguments from untrusted sources",
    regex: /\b(?:execSync|child_process\.exec|Runtime\.getRuntime\(\)\.exec|os\.system)\s*\(/,
    extensions: new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py", ".java"]),
  },
  {
    id: "code.python-shell-true",
    category: "command-injection",
    description: "Python subprocess with shell interpretation enabled",
    regex: /\bshell\s*=\s*True\b/,
    extensions: new Set([".py"]),
  },
  {
    id: "code.unsafe-deserialization",
    category: "deserialization",
    description: "Potentially unsafe deserialization; establish attacker control and type restrictions",
    regex: /\b(?:pickle\.loads?|yaml\.unsafe_load|unserialize|ObjectInputStream)\b/,
    extensions: new Set([".py", ".php", ".java", ".kt"]),
  },
  {
    id: "code.raw-html",
    category: "xss",
    description: "Raw HTML rendering; verify source, sanitization, and browser context",
    regex: /(?:\bdangerouslySetInnerHTML\b|\binnerHTML\s*=|\bv-html\s*=|\[innerHTML\])/,
    extensions: new Set([".html", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".vue"]),
  },
  {
    id: "code.tls-verification-disabled",
    category: "transport-security",
    description: "TLS certificate verification appears disabled",
    regex: /(?:rejectUnauthorized\s*:\s*false|verify\s*=\s*False|CURLOPT_SSL_VERIFYPEER\s*,\s*(?:false|0))/,
    extensions: new Set([".js", ".mjs", ".cjs", ".ts", ".py", ".php"]),
  },
  {
    id: "code.weak-randomness",
    category: "cryptography",
    description: "Non-cryptographic randomness; determine whether the value protects a security boundary",
    regex: /\b(?:Math\.random\(\)|random\.random\(\))/,
    extensions: new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py"]),
  },
  {
    id: "code.unvalidated-redirect",
    category: "redirects",
    description: "Redirect target assignment; trace whether an attacker controls the destination",
    regex: /\b(?:redirect|location\.href|location\.assign)\s*\(/,
    extensions: new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]),
  },
  {
    id: "ci.write-all",
    category: "supply-chain",
    description: "GitHub Actions workflow grants write-all permissions",
    regex: /^\s*permissions\s*:\s*write-all\s*(?:#.*)?$/,
    pathPattern: /^\.github\/workflows\/.*\.ya?ml$/i,
  },
  {
    id: "ci.pull-request-target",
    category: "supply-chain",
    description: "pull_request_target workflow; inspect checkout and use of untrusted PR input",
    regex: /\bpull_request_target\s*:/,
    pathPattern: /^\.github\/workflows\/.*\.ya?ml$/i,
  },
  {
    id: "config.cors-wildcard",
    category: "configuration",
    description: "Wildcard CORS policy; confirm credentials and protected response exposure",
    regex: /(?:Access-Control-Allow-Origin["']?\s*[:,=]\s*["']\*|origin\s*:\s*["']\*["'])/i,
    extensions: new Set([".conf", ".go", ".java", ".js", ".json", ".mjs", ".py", ".ts", ".yaml", ".yml"]),
  },
  {
    id: "config.debug-enabled",
    category: "configuration",
    description: "Debug mode appears enabled; determine whether configuration ships to production",
    regex: /\bDEBUG\s*[:=]\s*(?:true|True|1)\b/,
    extensions: new Set([".env", ".ini", ".js", ".json", ".mjs", ".py", ".toml", ".ts", ".yaml", ".yml"]),
  },
  {
    id: "iac.world-open-ingress",
    category: "infrastructure",
    description: "World-open network range; verify exposed port and deployed context",
    regex: /["']0\.0\.0\.0\/0["']/,
    extensions: new Set([".json", ".tf", ".yaml", ".yml"]),
  },
];

function usage() {
  return `Authorized repository audit triage\n\nUsage:\n  node audit-repo.mjs --repo /absolute/repo --scope /absolute/scope.json --out /absolute/output\n\nThe command is offline and read-only with respect to the target repository. It refuses to run without a matching, active authorization contract.`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (!arg.startsWith("--")) throw new Error(`Unexpected argument: ${arg}`);
    const name = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${name}`);
    parsed[name] = value;
    index += 1;
  }
  for (const required of ["repo", "scope", "out"]) {
    if (!parsed[required]) throw new Error(`Missing required argument: --${required}`);
  }
  return parsed;
}

function git(repo, args) {
  const result = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    const detail = result.stderr.trim() || `git exited with status ${result.status}`;
    throw new Error(detail);
  }
  return result.stdout.trim();
}

function normalizeRepository(value) {
  let normalized = String(value).trim();
  normalized = normalized.replace(/^git@github\.com:/i, "https://github.com/");
  normalized = normalized.replace(/^ssh:\/\/git@github\.com\//i, "https://github.com/");
  normalized = normalized.replace(/^http:\/\//i, "https://");
  normalized = normalized.replace(/\.git\/?$/i, "");
  normalized = normalized.replace(/\/+$/, "");
  return normalized.toLowerCase();
}

function validateScope(scope, repository) {
  const errors = [];
  const now = new Date();
  const requiredStrings = ["program", "policyUrl", "repository", "authorizationBasis", "policyCheckedAt", "testedCommit"];
  for (const field of requiredStrings) {
    if (typeof scope[field] !== "string" || scope[field].trim() === "") errors.push(`${field} must be a non-empty string`);
  }
  if (scope.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (scope.authorizationConfirmed !== true) errors.push("authorizationConfirmed must be true");
  if (!Array.isArray(scope.allowedTechniques) || scope.allowedTechniques.length === 0) errors.push("allowedTechniques must be a non-empty array");
  if (!Array.isArray(scope.prohibitedTechniques)) errors.push("prohibitedTechniques must be an array");
  if (typeof scope.policyUrl === "string" && !scope.policyUrl.startsWith("https://")) errors.push("policyUrl must use HTTPS");
  if (typeof scope.testedCommit === "string" && !/^[a-f0-9]{40}$/i.test(scope.testedCommit)) errors.push("testedCommit must be a full 40-character Git commit SHA");

  const checkedAt = new Date(scope.policyCheckedAt);
  if (Number.isNaN(checkedAt.getTime())) {
    errors.push("policyCheckedAt must be a valid ISO timestamp");
  } else {
    const ageMs = now.getTime() - checkedAt.getTime();
    if (ageMs < -5 * 60 * 1000) errors.push("policyCheckedAt cannot be in the future");
    if (ageMs > 7 * 24 * 60 * 60 * 1000) errors.push("policyCheckedAt is older than seven days; re-check the live policy");
  }

  const startsAt = new Date(scope.testingWindow?.startsAt);
  const endsAt = new Date(scope.testingWindow?.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    errors.push("testingWindow.startsAt and testingWindow.endsAt must be valid ISO timestamps");
  } else if (now < startsAt || now > endsAt) {
    errors.push("the current time is outside the authorized testing window");
  }

  if (scope.testedCommit && scope.testedCommit.toLowerCase() !== repository.commit.toLowerCase()) {
    errors.push(`testedCommit does not match HEAD (${repository.commit})`);
  }
  if (scope.repository && normalizeRepository(scope.repository) !== normalizeRepository(repository.origin)) {
    errors.push(`scope repository does not match origin (${repository.origin})`);
  }
  if (errors.length > 0) throw new Error(`Scope contract rejected:\n- ${errors.join("\n- ")}`);
}

function isProbablyBinary(buffer) {
  const sampleLength = Math.min(buffer.length, 8192);
  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] === 0) return true;
  }
  return false;
}

function sanitizeSnippet(line) {
  let output = line.trim().replace(/\s+/g, " ");
  for (const rule of SECRET_RULES) output = output.replace(rule.regex, "[REDACTED]");
  if (output.length > MAX_SNIPPET_CHARS) output = `${output.slice(0, MAX_SNIPPET_CHARS - 1)}…`;
  return output;
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function leadId(ruleId, relativePath, line) {
  return createHash("sha256").update(`${ruleId}\0${relativePath}\0${line}`).digest("hex").slice(0, 16);
}

function ruleApplies(rule, relativePath) {
  if (rule.pathPattern && !rule.pathPattern.test(relativePath)) return false;
  if (!rule.extensions) return true;
  const basename = path.basename(relativePath);
  const extension = basename.startsWith(".env") ? ".env" : path.extname(relativePath).toLowerCase();
  return rule.extensions.has(extension);
}

async function scanTextFile(absolutePath, relativePath, leads) {
  const buffer = await readFile(absolutePath);
  if (isProbablyBinary(buffer)) return { kind: "binary" };
  const text = buffer.toString("utf8");
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    for (const rule of SECRET_RULES) {
      const match = line.match(rule.regex);
      if (!match) continue;
      const material = match[rule.capture ?? 0];
      leads.push({
        id: leadId(rule.id, relativePath, lineNumber),
        rule: rule.id,
        category: "secret-exposure",
        confidence: "triage-required",
        file: relativePath,
        line: lineNumber,
        description: rule.description,
        evidence: `[REDACTED sha256:${fingerprint(material)}]`,
      });
    }
    for (const rule of CODE_RULES) {
      if (!ruleApplies(rule, relativePath) || !rule.regex.test(line)) continue;
      leads.push({
        id: leadId(rule.id, relativePath, lineNumber),
        rule: rule.id,
        category: rule.category,
        confidence: "triage-required",
        file: relativePath,
        line: lineNumber,
        description: rule.description,
        evidence: sanitizeSnippet(line),
      });
    }
  }
  return { kind: "text", lines: lines.length };
}

async function inventoryRepository(repo, out) {
  const files = [];
  const excluded = [];
  const symlinks = [];
  const errors = [];
  const manifests = [];
  const sensitivePaths = [];
  const leads = [];
  const languages = new Map();
  const outRelative = path.relative(repo, out);
  const outIsInside = outRelative !== "" && !outRelative.startsWith("..") && !path.isAbsolute(outRelative);

  async function walk(directory, relativeDirectory = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const relativePath = path.posix.join(relativeDirectory.split(path.sep).join(path.posix.sep), entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (outIsInside && (relativePath === outRelative || relativePath.startsWith(`${outRelative}${path.sep}`))) {
        excluded.push({ path: relativePath, reason: "audit output directory" });
        continue;
      }
      if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) {
        excluded.push({ path: relativePath, reason: "generated/dependency metadata directory" });
        continue;
      }
      if (entry.isSymbolicLink()) {
        const stats = await lstat(absolutePath);
        symlinks.push({ path: relativePath, bytes: stats.size });
        continue;
      }
      if (entry.isDirectory()) {
        await walk(absolutePath, relativePath);
        continue;
      }
      if (!entry.isFile()) continue;

      try {
        const stats = await lstat(absolutePath);
        const extension = path.extname(entry.name).toLowerCase() || "[no extension]";
        languages.set(extension, (languages.get(extension) ?? 0) + 1);
        const fileRecord = { path: relativePath, bytes: stats.size, kind: "unscanned" };
        files.push(fileRecord);
        if (MANIFEST_NAMES.has(entry.name)) manifests.push(relativePath);
        if (SENSITIVE_PATH_PATTERN.test(relativePath)) sensitivePaths.push(relativePath);
        if (stats.size > MAX_TEXT_BYTES) {
          fileRecord.kind = "large";
          continue;
        }
        const result = await scanTextFile(absolutePath, relativePath, leads);
        Object.assign(fileRecord, result);
      } catch (error) {
        errors.push({ path: relativePath, error: error.message });
      }
    }
  }

  await walk(repo);
  leads.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
  return {
    inventory: {
      generatedAt: new Date().toISOString(),
      limits: { maxTextBytes: MAX_TEXT_BYTES },
      totals: {
        files: files.length,
        textFiles: files.filter((file) => file.kind === "text").length,
        binaryFiles: files.filter((file) => file.kind === "binary").length,
        largeFiles: files.filter((file) => file.kind === "large").length,
        symlinks: symlinks.length,
        excludedDirectories: excluded.length,
        readErrors: errors.length,
      },
      languages: [...languages.entries()].map(([extension, count]) => ({ extension, count })).sort((a, b) => b.count - a.count || a.extension.localeCompare(b.extension)),
      manifests,
      sensitivePaths,
      excluded,
      symlinks,
      errors,
      files,
    },
    leads,
  };
}

function buildSummary(repository, inventory, leads) {
  const byRule = new Map();
  for (const lead of leads) byRule.set(lead.rule, (byRule.get(lead.rule) ?? 0) + 1);
  const ruleRows = [...byRule.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const totals = inventory.totals;
  return `# Authorized repository audit triage\n\n` +
    `- Repository: \`${repository.origin}\`\n` +
    `- Commit: \`${repository.commit}\`\n` +
    `- Generated: ${inventory.generatedAt}\n` +
    `- Files inventoried: ${totals.files}\n` +
    `- Text files scanned: ${totals.textFiles}\n` +
    `- Binary / large files: ${totals.binaryFiles} / ${totals.largeFiles}\n` +
    `- Excluded generated/dependency directories: ${totals.excludedDirectories}\n` +
    `- Triage leads: ${leads.length}\n\n` +
    `Scanner matches are leads, not confirmed vulnerabilities. Validate reachability, attacker control, missing controls, and impact before reporting. Secret-shaped values are redacted and must never be tested as credentials.\n\n` +
    `## Leads by rule\n\n` +
    (ruleRows.length > 0 ? `| Rule | Count |\n| --- | ---: |\n${ruleRows.map(([rule, count]) => `| \`${rule}\` | ${count} |`).join("\n")}\n` : "No deterministic leads found. Manual review is still required.\n") +
    `\n## Coverage notes\n\n` +
    `- Review excluded directories and large/binary files deliberately; generated artifacts can still affect release security.\n` +
    `- Review all ${inventory.manifests.length} detected manifests/lockfiles with ecosystem-native dependency tooling.\n` +
    `- Prioritize the ${inventory.sensitivePaths.length} security-sensitive paths recorded in \`inventory.json\`.\n` +
    `- Record rejected leads with a concise reason and produce one report per confirmed root cause.\n`;
}

export async function runAudit({ repo: repoInput, scope: scopeInput, out: outInput }) {
  const repo = await realpath(path.resolve(repoInput));
  const scopePath = await realpath(path.resolve(scopeInput));
  const out = path.resolve(outInput);
  const repository = {
    origin: git(repo, ["remote", "get-url", "origin"]),
    commit: git(repo, ["rev-parse", "HEAD"]),
  };
  const scope = JSON.parse(await readFile(scopePath, "utf8"));
  validateScope(scope, repository);

  const { inventory, leads } = await inventoryRepository(repo, out);
  await mkdir(out, { recursive: true });
  const metadata = {
    repository,
    authorization: {
      program: scope.program,
      policyUrl: scope.policyUrl,
      policyCheckedAt: scope.policyCheckedAt,
      testingWindow: scope.testingWindow,
      authorizationBasis: scope.authorizationBasis,
      allowedTechniques: scope.allowedTechniques,
      prohibitedTechniques: scope.prohibitedTechniques,
    },
    tools: {
      node: process.version,
      git: git(repo, ["--version"]),
      scanner: "authorized-bug-bounty-auditor/0.1.0",
    },
  };
  await Promise.all([
    writeFile(path.join(out, "audit-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 }),
    writeFile(path.join(out, "inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 }),
    writeFile(path.join(out, "leads.json"), `${JSON.stringify(leads, null, 2)}\n`, { mode: 0o600 }),
    writeFile(path.join(out, "summary.md"), buildSummary(repository, inventory, leads), { mode: 0o600 }),
  ]);
  return { out, repository, inventory, leads };
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      process.stdout.write(`${usage()}\n`);
      return;
    }
    const result = await runAudit(args);
    process.stdout.write(`Audit triage complete: ${result.out}\n`);
    process.stdout.write(`Inventoried ${result.inventory.totals.files} files and emitted ${result.leads.length} triage leads.\n`);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n\n${usage()}\n`);
    process.exitCode = 1;
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
