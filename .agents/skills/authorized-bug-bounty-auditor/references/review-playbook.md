# Repository-wide review playbook

Use this guide after inventory. Adapt it to the languages and deployment model actually present.

## Repository and supply chain

- Review every manifest and lockfile, workspace boundary, submodule, vendored package, patch file, build script, and generated artifact source.
- Check package names for dependency confusion, unpinned Git dependencies, mutable action tags, unverified downloads, and checksum bypasses.
- Review install, prepare, postinstall, build, release, and publish scripts before executing them.
- Compare CI permissions with the minimum needed. Treat pull-request titles, bodies, branches, artifacts, caches, and fork code as attacker-controlled.
- Inspect `pull_request_target`, workflow chaining, artifact reuse, cache poisoning, OIDC claims, environment approvals, and secret exposure to forks.

## Authentication and authorization

- Enumerate every identity type: anonymous, user, administrator, service, tenant, organization, integration, and background worker.
- Trace object ownership checks at every read and write, not only in the UI or route layer.
- Check role transitions, invitation acceptance, account linking, password reset, email changes, API keys, session revocation, and impersonation.
- Test locally for IDOR/BOLA, confused deputy behavior, tenant crossover, mass assignment, and policy differences between equivalent endpoints.
- Inspect default-deny behavior, stale caches, case normalization, Unicode, duplicate parameters, and alternate identifier forms.

## Injection and unsafe interpretation

- Follow untrusted input into SQL/NoSQL queries, shells, templates, regular expressions, paths, URLs, headers, logs, and dynamic language features.
- Distinguish parameterization from string escaping. Check identifiers and sort/order fragments that parameters cannot cover.
- Review deserialization, YAML/XML parsers, archive extraction, image/document conversion, and plugin loading.
- Check browser and server rendering separately for stored, reflected, and DOM-based XSS. Account for framework escaping and sanitizer configuration.
- Inspect CSV/formula injection, response splitting, request smuggling assumptions, and log-forging only where the deployed stack makes them reachable.

## Files, URLs, and parsers

- Normalize paths before authorization. Check traversal, symlink races, archive slip, overwrite behavior, extension confusion, and content-type trust.
- For outbound requests, check scheme, redirect, DNS rebinding, IP canonicalization, IPv6, userinfo, proxy behavior, and access to cloud metadata or internal control planes.
- Bound parser depth, decompression ratio, file count, dimensions, and memory usage without stress-testing production.
- Verify that temporary files, exported reports, signed URLs, and uploaded objects inherit correct access controls and retention.

## Secrets and cryptography

- Treat secret scanner output as sensitive. Record file, line, rule, and one-way fingerprint; never copy the value into a report.
- Identify whether a suspected secret is a fixture, revoked value, public identifier, or live credential without attempting authentication.
- Check entropy sources, nonce reuse, signature verification, algorithm selection, key separation, rotation, and failure behavior.
- Prefer established libraries. Review custom token, encryption, password hashing, and certificate validation code closely.

## Web, APIs, and clients

- Check CORS, CSRF, CSP, cookie flags, redirect validation, caching of personalized content, proxy trust, and host-header use.
- Review rate limits as business controls, but never load-test production. Reproduce bypasses with local unit or integration tests.
- For GraphQL and RPC, map field-level authorization, batching, aliases, resolver differences, and introspection policy.
- For browser extensions, inspect host permissions, message origin checks, content-script/page boundaries, externally connectable resources, and update paths.
- For desktop/mobile, inspect deep links, WebViews, IPC, exported components, local storage, certificate handling, and update signatures.

## Infrastructure and deployment

- Review public exposure, IAM wildcards, trust policies, network paths, storage ACLs, encryption, logging, and secret injection.
- Check container users, capabilities, mounts, namespaces, build contexts, base image pinning, and runtime socket access.
- Inspect debug modes, source maps, verbose errors, default credentials, sample deployments, and environment-specific security drift.
- Distinguish a dangerous example from shipped production configuration and explain reachability.

## Validation standard

Require all four elements before confirmation:

1. attacker control over the source;
2. a reachable path in supported configuration;
3. missing or bypassable security control;
4. concrete impact across a trust boundary.

Prefer a failing regression test or a fully local inert proof. Record negative tests and compensating controls. Combine variants that share one root cause into one report unless the bounty policy says otherwise.
