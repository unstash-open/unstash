# Channel launch pack (Plan B)

Use these drafts when Reddit moderator replies are delayed. Adapt each post to
the venue. Do not paste the same text across platforms on the same day. Product
first; funding secondary where the venue allows it, and omitted entirely from
Show HN. Never frame contributions as investment, equity, token sale or
guaranteed delivery of later milestones.

Preconditions before posting anywhere:

1. public source repository is live;
2. both explorer links resolve to the published wallets;
3. prototype works on desktop and a phone browser.

## Show HN (Hacker News)

**Title**

Show HN: Unstash – local-first queue for saved links you never reopen

**Body**

I kept saving useful Reddit posts and links, then never acting on them. The
list grew; the utility did not.

Unstash is a small browser prototype that forces one missing question when you
save something: what will you actually do with it — read, make, or keep?

Current build:

- add any URL with a Read / Make / Keep action;
- search and complete items;
- export the queue as Markdown;
- store everything in local storage (no account, no remote vault).

The current build also imports Reddit's official saved-post CSV locally. Not
built yet: live-save browser extension, on-device summaries and resurfacing.

Live prototype: https://unstash-open.vercel.app/prototype

Source: https://github.com/unstash-open/unstash

Curious what HN thinks is the right resurfacing cadence: daily queue, weekly
digest, or only search-when-needed?

Keep the submission and thread product-only. Show HN accepts things people can
try and explicitly excludes fundraisers and landing pages. If someone
independently asks how development is funded, answer factually without turning
the reply into a funding pitch.

## Indie Hackers

**Title**

Building a local-first “saved ≠ used” queue in public (no account)

**Body**

Problem: saved posts die in a graveyard. I built Unstash so each save becomes a
concrete next step.

What ships today:

- private in-browser queue;
- Read / Make / Keep labels;
- search + completion;
- Markdown export.

What shipped: local import of Reddit's official saved-post CSV with no account
access or upload. What is next: a permission-light live-save extension.

The active milestone has a transparent 500 USDT budget and public on-chain
total. The broader 10,000 USDT roadmap is a stretch plan. Contributions buy
nothing financial; the released prototype stays up even if the milestone is
not reached.

Links:

- Prototype: https://unstash-open.vercel.app
- Source: https://github.com/unstash-open/unstash
- Funding policy: https://unstash-open.vercel.app (Fund / Transparency)

Question for builders: would you pay with attention (weekly digest) or prefer a
strict daily queue you clear like email?

## Dev.to article outline

**Title**

Saved ≠ used: a local-first queue for links you meant to act on

**Outline**

1. The graveyard problem (2 short paragraphs).
2. Design choice: action label at save time, not folders later.
3. Why local-first for v0 (privacy, no account tax, portable Markdown).
4. What works / what does not (honest list).
5. How the public USDT ledger funds remaining work without selling user data.
6. Ask for feedback on data model before extension work.

End with prototype + source links. Keep the funding section under ~15% of the
article length.

## Short social (X / Bluesky)

Saved posts ≠ used posts.

Unstash: paste a link, pick Read / Make / Keep, search the queue, export
Markdown. Runs in your browser. No account.

Try: https://unstash-open.vercel.app  
Source: https://github.com/unstash-open/unstash

## Product Hunt (when source + demo are ready)

**Tagline**

Local-first queue that turns saved links into next steps

**Description (first paragraph)**

Unstash helps you stop burying useful posts. Add a link, choose Read / Make /
Keep, search your queue and export Markdown. Data stays on your device in the
current prototype.

Mention the voluntary funding page only in Maker comment / links, not in the
first screenshot captions.

Use at least two product gallery images. Product Hunt currently accepts launch
videos through a public YouTube URL, so upload the AI-produced demo there before
adding it to the gallery.

## Comment-response rules (all channels)

- disclose ownership immediately;
- answer product and technical questions first;
- never invent users, donors or traction;
- move people through try → feedback → optional support, in that order;
- if funding is challenged, point to FUNDING.md and the public wallets;
- do not argue removals—ask once, accept the answer;
- ship a weekly update where the venue allows progress posts.
