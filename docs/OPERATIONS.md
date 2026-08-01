# Launch operations

## Current stage — activation before distribution

From 2026-08-01 through 2026-08-15, the operating plan is the bounded
[14-day activation test](./BETA_14_DAY.md). The primary route is `/beta`; a
guided start is `/beta/run`, and the three result routes provide aggregate
completion signals. Do not add features or widen the funding push until the
pass / pause rule has evidence.

Reddit publishing is paused while u/East_Mode_7908 remains restricted and its
appeal is unresolved. The Product Hunt account was deleted and must not be
recreated. Neither platform is a blocker for running the product test through
allowed direct links and GitHub.

## Before public launch

- [x] Record both public receiving addresses.
- [ ] Verify each address with a small inbound USDT transfer on its exact network.
- [x] Confirm the site source shows both full addresses.
- [x] Confirm both block-explorer links resolve to the intended addresses.
- [x] Record the UTC launch cutoff: 2026-07-23 14:26:45 UTC.
- [x] Publish the source repository and funding policy.
- [x] Test the prototype on desktop and mobile (build/tests + live page smoke).
- [x] Ship Chromium extension developer preview 0.1 with activeTab only.
- [ ] Ask target subreddit moderators where fundraising rules are unclear.
      (Plan B channels proceed without waiting; see below.)

## Plan B — do not wait on Reddit alone

Reddit moderator silence must not freeze the campaign. The project lives when
there is public source, regular product shipping and traffic from more than one
venue. Drafts: [CHANNEL_LAUNCH.md](./CHANNEL_LAUNCH.md).

### Trust unlocks (do first)

1. Publish the public source repository and keep FUNDING.md in sync.
2. Smoke-test both campaign wallets with a small inbound USDT transfer; confirm
   explorer links.
3. Run the prototype on desktop and a phone browser; fix blockers before posts.

### Distribution order (7 days after unlocks)

| Day | Channel | Focus |
| --- | --- | --- |
| 1 | Show HN | Direct prototype; product and feedback only |
| 1–2 | Indie Hackers | Building in public; ask about queue cadence |
| 2–3 | Dev.to | Longer write-up for search / long tail |
| 3 | X / Bluesky | Demo GIF + prototype link |
| 4–5 | Direct beta link | Share only where project tests are explicitly allowed |
| ongoing | Weekly update | Site / README / allowed venues |
| when replied | Reddit | Use [REDDIT_LAUNCH.md](./REDDIT_LAUNCH.md) after mod OK |

Rules for every channel:

- adapt the text; do not mass-paste;
- product first, funding secondary;
- keep Show HN entirely product-only and link directly to `/prototype`;
- no investment / token / equity framing;
- no unsolicited DMs or sockpuppet support.

### Conversion order

1. Let the visitor try the working importer or install extension 0.1.
2. Ask for one useful signal through the guided beta result routes; detailed
   GitHub feedback remains optional.
3. Show optional funding only after the visitor has seen the product work.

Weekly public signals: substantive replies, GitHub stars, opened issues,
confirmed contributors and shipped releases. Do not manufacture testimonials,
donations, votes or usage numbers.

Page-level traffic is measured with cookie-free Vercel Web Analytics. Review
only aggregate visits, route views and referrers for `/beta`, `/beta/run` and
the result routes. Never add saved links, queue contents, wallet data or other
personal information to analytics events.

### Funding rails

- Permission-free Reddit CSV import and extension 0.1 shipped before funding.
  The active target is 500 USDT for cross-browser hardening; 10,000 USDT is the
  broader stretch roadmap.
- Source of truth remains the public TRC20 and ERC20 campaign wallets and the
  on-chain accounting rule in FUNDING.md.
- Optional fiat doors (GitHub Sponsors, Ko-fi, Liberapay, Open Collective) may
  be added later as convenience. Until an explicit conversion rule is published,
  fiat support does **not** count toward the USDT target.
- Keep `.github/FUNDING.yml` pointing at the live Fund / Transparency pages.

### Product cadence while waiting

1. Harden extension 0.1 for Firefox, automated tests and store packaging.
2. Post a weekly update (template below) even if incoming USDT is zero.
3. Keep short demos of extension capture and CSV import ready to attach.

## Weekly update template

### Unstash update — week of YYYY-MM-DD

**Shipped**

- ...

**Funding**

- Confirmed incoming total: ... USDT
- New project spend: ... USDT
- Remaining project funds: ... USDT

**Next**

- ...

**Blockers or scope changes**

- None / ...

## Monitoring

- The site refreshes the confirmed incoming-transfer total every 60 seconds.
- The API response is cached for 60 seconds to avoid exceeding public chain API
  limits.
- Compare the TRC20 and ERC20 subtotals with their explorers once per week.
- Never connect the receiving wallet or expose a seed phrase to the site.

## Reddit cadence

- Start with one approved, community-specific feedback post.
- Stay present for replies during the first two hours.
- Do not cross-post identical text.
- Do not send unsolicited direct messages.
- Share milestones only in communities that allow repeat project updates.
- If moderators have not replied, proceed with Plan B above; do not stall.
