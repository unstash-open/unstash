# Security audit revenue operations

The repository now includes a paid, authorization-gated security review at
`/security-audit`. The commercial flow is:

1. a customer chooses a fixed plan;
2. the intake records the GitHub repository and authorization basis;
3. the server creates a Stripe Checkout Session with a server-owned price;
4. Stripe confirms the card payment and signs `checkout.session.completed`;
5. the verified event is sent to the private fulfillment webhook;
6. the audit starts only after scope and repository access are verified.

The customer never supplies a Stripe Price ID, price, success URL or
fulfillment destination. Those values remain server-controlled.

## Plans

| Plan | Billing | Price | Initial delivery target |
| --- | --- | ---: | --- |
| Beta Repository Audit | One-time | $490 | 3 business days |
| Standard Repository Audit | One-time | $950 | 5 business days |
| Managed Security Monitor | Subscription | $499/month | Monthly review |

Prices are defined in `lib/security-audit.ts`. Change them only after checking
the landing page, structured data, Stripe checkout, terms and sales copy for
consistency.

## Required production configuration

Set these environment variables in the deployment control plane:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://unstash-open.vercel.app
```

Configure the Stripe webhook endpoint:

```text
https://unstash-open.vercel.app/api/security-audit/webhook
```

Subscribe it to:

- `checkout.session.completed`
- `customer.subscription.deleted`

The Stripe SDK uses the fetch-based HTTP client so checkout remains compatible
with the deployed worker runtime. Never expose `STRIPE_SECRET_KEY` or
`STRIPE_WEBHOOK_SECRET` through a `NEXT_PUBLIC_` variable.

## Fulfillment notification

Stripe remains the order system of record. To receive a private notification
for paid work, configure:

```text
SECURITY_AUDIT_FULFILLMENT_WEBHOOK_URL=https://your-private-endpoint.example/audit-orders
SECURITY_AUDIT_FULFILLMENT_WEBHOOK_SECRET=replace-with-a-long-random-value
```

The notification includes the Stripe event ID, session ID, customer email,
plan, repository URL, authorization confirmation, payment status and bounded
scope notes. It does not include card data or Stripe secrets. The Stripe event
ID is sent as `Idempotency-Key`; the receiving system must reject or safely
ignore duplicate event IDs.

When no fulfillment URL is configured, checkout still works and the order is
visible in Stripe, but the worker logs a warning. Do not launch paid traffic in
that state because response time would depend on manually checking Stripe.

## Local Stripe test

Use Stripe test-mode credentials. Forward signed events to the local route:

```bash
stripe listen --forward-to localhost:3000/api/security-audit/webhook
```

Copy the emitted `whsec_...` value into `STRIPE_WEBHOOK_SECRET`, then open:

```text
http://localhost:3000/security-audit/intake?plan=beta
```

Complete checkout with a Stripe test card. Confirm all of the following:

- Checkout shows the server-defined product and price.
- The success page renders after payment.
- A signed event reaches the fulfillment endpoint exactly once logically.
- An invalid webhook signature returns HTTP 400.
- Missing authorization or terms acceptance prevents checkout.
- Cancellation returns to the intake without creating paid work.

## Order handling playbook

For every paid order:

1. Match the fulfillment payload to the Stripe Dashboard event.
2. Re-check ownership or the live bug bounty policy.
3. Record the exact repository origin and immutable commit.
4. Send the scope contract for confirmation.
5. Request the least-privilege repository access needed.
6. Start the delivery clock only after authorization and access are complete.
7. Run the Authorized Bug Bounty Auditor workflow.
8. Deliver the redacted report and review call.
9. Remove private repository access after the engagement unless managed
   monitoring is active.

If authorization cannot be verified, stop before scanning and refund the
payment according to `/security-audit/terms`.

## First-revenue checklist

- Use live Stripe keys only after test-mode checkout and webhook delivery pass.
- Connect the fulfillment webhook to an inbox or queue monitored every business
  day.
- Publish one sanitized sample report without client or secret data.
- Sell three beta audits before adding more scanner features.
- Track qualified visits, completed intakes, paid checkouts, delivery hours,
  confirmed findings, retest completion and managed-plan conversions.
- Do not advertise a guaranteed vulnerability count or bounty payout.

GitHub Marketplace should remain a later distribution channel. A paid GitHub
App requires publisher verification and an installation threshold; direct
Stripe checkout is the initial commercial path.
