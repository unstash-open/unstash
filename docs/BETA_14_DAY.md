# Unstash 14-day activation test

Window: 2026-08-01 through 2026-08-15 (UTC).

## Decision to test

Unstash is useful only if a person can turn one forgotten save into one
finished action. Traffic, donations, stars and feature requests are secondary
until that activation loop works.

## Funnel

Vercel Web Analytics pageviews provide the aggregate funnel without custom
events or personal data:

| Route | Meaning |
| --- | --- |
| `/beta` | Read the test and its privacy promise |
| `/beta/run` | Started the guided product test |
| `/beta/useful` | Completed a save and said it became useful |
| `/beta/not-yet` | Completed a save but did not get enough value |
| `/beta/privacy` | Completed a save and reported privacy friction |

The product never sends a saved URL, title, CSV row, queue item, browser-storage
value or query string to analytics. Result pages are `noindex` and exist only as
anonymous aggregate signals.

## Pass / pause rule

By the end of the window, continue the current direction only if there are:

- at least 5 independent visits to `/beta/run`;
- at least 3 total visits across the three result routes;
- at least 2 visits to `/beta/useful`;
- no repeated technical or privacy blocker in independent feedback.

If the threshold is missed, do not add another feature. Change the problem,
audience or positioning, then run a new bounded test.

## Distribution constraints

- Reddit: no posting, commenting or editing while the account restriction and
  appeal are unresolved.
- Product Hunt: account deleted; do not recreate it or launch there.
- No mass posting, unsolicited DMs, artificial votes, synthetic testimonials or
  manufactured usage.
- Share the product test only where project links are explicitly allowed, and
  lead with the five-minute task rather than funding.

## Review format

At the end of the window, record:

1. unique visitors and pageviews for the five funnel routes;
2. referrers to `/beta` and `/beta/run`;
3. useful / not-yet / privacy outcome counts;
4. independent GitHub feedback in plain language;
5. decision: continue, reposition or pause.

Funding remains optional and is evaluated only after the activation evidence.
