# Vulnerability report template

## Title

`[component] Attacker action causes security impact through root cause`

## Program and scope

- Program:
- Policy URL:
- Repository:
- Tested commit:
- Affected versions/configurations:

## Summary

Explain the vulnerable security boundary, attacker prerequisite, root cause, and impact in three to five sentences. Avoid severity adjectives unsupported by evidence.

## Affected code

| File and line | Role in exploit path |
| --- | --- |
| `path/to/file.ext:123` | Attacker-controlled source |
| `path/to/file.ext:456` | Missing security control |
| `path/to/file.ext:789` | Sensitive sink |

## Preconditions

- Required attacker privileges:
- Required victim action:
- Required deployment configuration:
- Scope or tenant boundary crossed:

## Reproduction

Provide the smallest local-only, deterministic sequence.

1. Check out the tested commit.
2. Configure a disposable local environment.
3. Run the minimal test or inert proof.
4. Observe the result below.

Do not include live credentials, personal data, destructive payloads, or unnecessary weaponization.

## Observed result

Include sanitized output, a failing test, or a screenshot. State what was directly observed rather than inferred.

## Expected security property

State the authorization, isolation, validation, integrity, or confidentiality property that should hold.

## Impact

Describe the maximum demonstrated impact and its limits. Separate confirmed impact from deployment-dependent possibilities.

## Severity

- Program rating:
- CVSS version/vector (if useful):
- Rationale:

## Remediation direction

Describe the control that should be enforced and the layer where it belongs. Avoid prescribing a large patch unless requested by the maintainer.

## Regression test

Describe a test that fails before the fix and passes after it, including at least one negative or cross-tenant case.

## Disclosure notes

- Discovery date:
- Data accessed: none / synthetic local data only
- Production systems contacted: no / explicitly authorized details
- Secret material redacted: yes
- Duplicate or related reports checked:
