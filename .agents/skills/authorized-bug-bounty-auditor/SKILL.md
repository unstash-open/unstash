---
name: Authorized Bug Bounty Auditor
description: This skill should be used when the user asks to "audit a GitHub repository for a bug bounty", "find vulnerabilities in an in-scope repository", "проверить репозиторий для bug bounty", or "создать отчёт об уязвимости". It performs authorization-gated, repository-wide defensive code review and prepares evidence-backed disclosure reports without attacking production systems.
version: 0.1.0
---

# Authorized Bug Bounty Auditor

Perform a repository-wide security audit for an explicitly authorized bug bounty or vulnerability disclosure program. Treat scope verification as part of the technical work, not as paperwork.

## Non-negotiable boundaries

1. Require a completed scope contract before scanning. Read `references/scope-contract.md` and create a JSON file from its template.
2. Verify the current program policy at its canonical URL. Record the policy URL, repository URL, tested commit, permitted techniques, prohibited techniques, and authorization confirmation.
3. Restrict work to repositories and components explicitly listed in scope. Do not infer authorization from public source code, an open issue tracker, or a generic security contact.
4. Prefer offline review, local builds, local tests, and disposable test environments. Do not probe production services unless the program policy explicitly permits the exact technique.
5. Never perform denial of service, persistence, destructive actions, social engineering, credential attacks, data exfiltration, or access to another person's data.
6. Stop at the minimum proof needed to demonstrate impact. Redact tokens, credentials, personal data, and other secrets from all outputs.
7. Treat scanner matches as leads, not vulnerabilities. Report only findings with a reachable source, a security boundary crossing, a concrete sink, and reproducible impact.

If authorization or scope cannot be verified, stop active testing. Offer a passive review of user-owned code or help identify an official program instead.

## Workflow

### 1. Establish the audit record

Create a fresh audit directory outside the target repository or in its ignored local workspace. Store:

- the completed scope JSON;
- repository origin and immutable commit SHA;
- tool versions and commands;
- generated inventory and scanner output;
- review notes, rejected hypotheses, and final reports.

Avoid committing audit artifacts, suspected secrets, or proof-of-concept material to the target repository.

### 2. Freeze and inventory the target

Work from a clean clone or a read-only snapshot at the recorded commit. Do not run project lifecycle scripts during installation unless they have been reviewed.

Run the bundled inventory and triage scanner:

```bash
node scripts/audit-repo.mjs \
  --repo /absolute/path/to/repository \
  --scope /absolute/path/to/scope.json \
  --out /absolute/path/to/audit-output
```

Read `inventory.json`, `leads.json`, and `summary.md`. Confirm that generated files, vendored dependencies, binaries, fixtures, tests, examples, CI workflows, deployment manifests, and submodules have been accounted for. Exclude a category only with a written reason.

### 3. Build the attack-surface map

Identify trust boundaries before following individual matches:

- unauthenticated and authenticated entry points;
- authorization decisions and tenant boundaries;
- parsers, importers, upload handlers, webhooks, and URL fetchers;
- template rendering, shell execution, database queries, and deserialization;
- secret storage, signing, cryptography, session management, and recovery flows;
- build pipelines, release workflows, package publishing, and deployment credentials;
- extension permissions, desktop bridges, mobile deep links, and local IPC where present.

Trace data from attacker-controlled sources to sensitive sinks. Read `references/review-playbook.md` for category-specific checks.

### 4. Run deterministic checks

Use scanners already available in the environment. Prefer lockfile-aware and language-native tools. Keep all commands read-only and record exact versions and options.

Cover at minimum:

- dependency vulnerabilities using the repository lockfiles;
- static application security analysis;
- secret detection with redacted output;
- infrastructure-as-code and container configuration;
- CI/CD workflow permissions and untrusted-input handling;
- license or provenance anomalies only when they create a security risk.

Do not install arbitrary repository dependencies merely to satisfy a scanner. Review install scripts first and use a disposable environment when execution is necessary.

### 5. Validate hypotheses locally

For each plausible lead:

1. Identify the attacker prerequisite and controlled input.
2. Trace the complete call path to the security-sensitive operation.
3. Identify the missing or incorrect control.
4. Establish reachability in the shipped configuration.
5. Construct the smallest local regression test or inert proof.
6. Demonstrate impact without contacting production or accessing real user data.
7. Check nearby code for compensating controls and duplicates.
8. Record why false positives were rejected.

Never execute a suspected secret. Never use a discovered credential to test validity. Report the location and a one-way fingerprint only.

### 6. Prioritize findings

Separate results into:

- **Confirmed**: reproducible security boundary violation with evidence;
- **Needs maintainer context**: credible path whose exploitability depends on deployment facts;
- **Hardening**: useful defense-in-depth without demonstrated vulnerability;
- **Rejected**: false positive, unreachable code, test fixture, or intended behavior.

Estimate severity using the program's own rules first. Otherwise state attacker prerequisites, required privileges, user interaction, scope change, confidentiality/integrity/availability impact, and a transparent CVSS vector. Do not inflate severity.

### 7. Produce disclosure-ready output

Create one report per confirmed root cause using `references/finding-template.md`. Include exact commit, affected files and lines, minimal reproduction, observed result, expected security property, impact, remediation direction, and regression-test guidance.

Keep exploit code local until the program requests it. Redact secrets and personal data. Respect embargo and submission-channel requirements. Do not mass-submit low-confidence scanner output.

## Completion criteria

Consider an audit complete only when:

- scope and authorization are recorded;
- the full repository inventory is reviewed;
- all primary trust boundaries have an owner and review status;
- deterministic leads are triaged;
- confirmed findings are independently reproducible locally;
- rejected leads include a short rationale;
- reports contain no live secrets or unnecessary sensitive details.

## Resources

- `references/scope-contract.md` — mandatory authorization and scope schema.
- `references/review-playbook.md` — repository-wide manual review checklist.
- `references/finding-template.md` — disclosure-ready report template.
- `scripts/audit-repo.mjs` — dependency-free inventory, secret-redaction, and security-lead scanner.
