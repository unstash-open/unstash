# Launch operations

## Before public launch

- [x] Record both public receiving addresses.
- [ ] Verify each address with a small inbound USDT transfer on its exact network.
- [x] Confirm the site source shows both full addresses.
- [x] Confirm both block-explorer links resolve to the intended addresses.
- [x] Record the UTC launch cutoff: 2026-07-23 14:26:45 UTC.
- [x] Publish the source repository and funding policy.
- [x] Test the prototype on desktop and mobile (build/tests + live page smoke).
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
| 1 | Show HN | Product loop; funding one short paragraph |
| 1–2 | Indie Hackers | Building in public; ask about queue cadence |
| 2–3 | Dev.to | Longer write-up for search / long tail |
| 3 | X / Bluesky | Demo GIF + prototype link |
| 4–5 | Product Hunt | Only if source + short demo are ready |
| ongoing | Weekly update | Site / README / allowed venues |
| when replied | Reddit | Use [REDDIT_LAUNCH.md](./REDDIT_LAUNCH.md) after mod OK |

Rules for every channel:

- adapt the text; do not mass-paste;
- product first, funding secondary;
- no investment / token / equity framing;
- no unsolicited DMs or sockpuppet support.

### Funding rails

- The active target is 500 USDT for the Reddit import prototype. The 10,000
  USDT figure is the broader stretch roadmap.
- Source of truth remains the public TRC20 and ERC20 campaign wallets and the
  on-chain accounting rule in FUNDING.md.
- Optional fiat doors (GitHub Sponsors, Ko-fi, Liberapay, Open Collective) may
  be added later as convenience. Until an explicit conversion rule is published,
  fiat support does **not** count toward the USDT target.
- Keep `.github/FUNDING.yml` pointing at the live Fund / Transparency pages.

### Product cadence while waiting

1. Prototype permission-light Reddit import (active 500 USDT milestone).
2. Post a weekly update (template below) even if incoming USDT is zero.
3. Keep a 30–45s demo of paste → action → Markdown export ready to attach.

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
