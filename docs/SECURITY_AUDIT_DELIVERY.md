# Security audit delivery runbook

## Production readiness gate

Do not buy traffic or accept a live order until
`/api/security-audit/health` returns HTTP 200 with all checks true.

Required environment variables:

```text
POLAR_WEBHOOK_SECRET=<dedicated Polar endpoint secret>
SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL=https://private-queue.example/orders
SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET=<at least 32 random characters>
NEXT_PUBLIC_SECURITY_AUDIT_CONTACT_EMAIL=<verified business contact, optional>
```

The application returns 503 to Polar when the private fulfillment queue is absent
or invalid. Polar can then retry instead of silently acknowledging a paid order that
was not queued.

## Durable Supabase queue

The repository contains a ready-to-deploy private queue in `supabase/`:

- the migration creates `security_ops.audit_order_events` outside the schemas
  exposed through the Data API;
- `anon`, `authenticated` and `service_role` receive no schema or table grants;
- the Edge Function accepts only a custom bearer secret and matching
  `Idempotency-Key`/`eventId` values;
- a unique event ID makes Polar retries safe;
- the health request checks both the function and the private table.

Use a dedicated Supabase project for production order data. After selecting that
project, link the CLI, review the generated migration, push it, set a random secret
of at least 32 characters, and deploy the function:

```text
supabase link --project-ref <dedicated-project-ref>
supabase db push --linked
supabase secrets set SECURITY_AUDIT_FULFILLMENT_SECRET=<random-secret>
supabase functions deploy security-audit-orders --no-verify-jwt
```

Set the deployed function URL as
`SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL` in Vercel. Set the exact same random value
as `SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET`. Keep Supabase's automatically
provided `SUPABASE_DB_URL` server-only. Do not add `security_ops` to the exposed API
schemas.

Before enabling checkout traffic, send an authenticated `GET` to the function,
verify it returns `{"ready":true}`, and confirm the application health endpoint
also returns HTTP 200. Then deliver one signed Polar test event twice and confirm
the table contains one row.

## Order intake

1. Match the signed event ID, order ID, product and amount to Polar.
2. Deduplicate the event by `Idempotency-Key` in the private queue.
3. Assign an owner and acknowledgement deadline within one business day.
4. Re-verify repository ownership or official program authorization.
5. Freeze repository origin, immutable commit, allowed techniques and exclusions.
6. Request least-privilege access only after the scope contract is accepted.

## Delivery

1. Create an ignored audit directory and completed scope JSON.
2. Inventory the repository and run deterministic checks.
3. Triage every lead into Confirmed, Needs context, Hardening or Rejected.
4. Reproduce confirmed findings locally with synthetic data.
5. Peer-check severity, impact language and secret redaction.
6. Deliver the report and review call within the purchased target.
7. Record actual hours, accepted findings and remediation owner.

## Closure

1. Run the included retest when purchased.
2. Remove private repository access.
3. Schedule deletion of working copies under the published retention window.
4. Record outcome and ask permission before publishing any case study.
5. Reconcile Polar orders, refunds and subscriptions every business day.

## Incident handling

- Duplicate event: acknowledge without creating duplicate work.
- Queue unavailable: return non-2xx so Polar retries; alert the operator.
- Authorization cannot be verified: stop before analysis and initiate the documented refund.
- Secret in submitted material: stop, notify the customer, redact local copies and request rotation.
- Missed delivery target: notify the customer before the deadline with a new date and refund option for undelivered scope.
