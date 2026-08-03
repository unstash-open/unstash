# Scope contract

Complete this contract before any scan. Re-check the canonical policy on the day of testing because bounty scope and prohibited techniques can change.

This file is an audit guardrail, not legal proof. When the policy is ambiguous, ask the program owner before proceeding.

## Required JSON

```json
{
  "schemaVersion": 1,
  "program": "Example Security Bug Bounty",
  "policyUrl": "https://example.com/security/bug-bounty",
  "repository": "https://github.com/example/project",
  "authorizationConfirmed": true,
  "authorizationBasis": "Repository is explicitly listed under in-scope source code",
  "policyCheckedAt": "2026-08-01T00:00:00Z",
  "testedCommit": "0123456789abcdef0123456789abcdef01234567",
  "testingWindow": {
    "startsAt": "2026-08-01T00:00:00Z",
    "endsAt": "2026-08-08T00:00:00Z"
  },
  "allowedTechniques": [
    "offline source review",
    "local static analysis",
    "local proof of concept"
  ],
  "prohibitedTechniques": [
    "production exploitation",
    "denial of service",
    "accessing third-party data",
    "social engineering"
  ],
  "notes": "No network testing is authorized by this contract."
}
```

## Validation rules

- Use the canonical HTTPS policy URL, not a search result or cached copy.
- Match `repository` to the target's `origin` remote after normalizing an optional `.git` suffix and SSH/HTTPS GitHub forms.
- Use the exact 40-character commit SHA checked out for review.
- Set `authorizationConfirmed` to `true` only after reading the current policy.
- Describe the concrete authorization basis. A public repository alone is insufficient.
- Use an active testing window. Create a new contract when the policy or tested commit changes.
- List only techniques the policy permits. Absence from the prohibited list does not imply permission.
- Keep production network testing out of scope unless it is separately and explicitly authorized.

The bundled scanner refuses to run when required fields are missing, authorization is false, the testing window is inactive, the commit differs, or the repository origin does not match.

## Private and self-owned repositories

For a repository owned by the requester outside a public bounty program, use the internal authorization record or written owner approval as `authorizationBasis`. Keep the same technical limits and identify who can approve production testing.
