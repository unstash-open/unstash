# Launch operations

## Before public launch

- [x] Record both public receiving addresses.
- [ ] Verify each address with a small inbound USDT transfer on its exact network.
- [x] Confirm the site source shows both full addresses.
- [ ] Confirm both block-explorer links resolve to the intended addresses.
- [x] Record the UTC launch cutoff: 2026-07-23 14:26:45 UTC.
- [ ] Publish the source repository and funding policy.
- [ ] Test the prototype on desktop and mobile.
- [ ] Ask target subreddit moderators where fundraising rules are unclear.

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
