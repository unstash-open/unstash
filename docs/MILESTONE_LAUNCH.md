# Extension 0.1 milestone launch

Use this pack for the next product update only after the community's repeat-post
rules and timing allow it. Keep the Reddit update entirely product-focused.
Never mention funding, ask for votes, manufacture traction or send unsolicited
messages.

## AI-produced 29-second demo

The project demo is generated from the real product UI, synthetic motion,
captions and an Emma conversational AI voice. It contains no personal tabs,
account names, bookmarks, camera footage or wallet software.

Video: https://unstash-open.vercel.app/unstash-demo.mp4

| Time | Shot |
| --- | --- |
| 0–3.7s | AI title card: “Unstash Capture 0.1” |
| 3.7–9.5s | Show the permission-free Reddit CSV import panel |
| 9.5–14.1s | Import a sample `saved_posts.csv` locally |
| 14.1–19.6s | Show imported cards and mark one done |
| 19.6–24.1s | Search the local queue |
| 24.1–29s | “Extension 0.1 shipped · one permission” |

Suggested caption:

> Saved posts kept becoming a graveyard, so I made each save choose a next
> action. Unstash now imports Reddit CSV files locally and captures the active
> tab with one temporary permission—no login or remote vault. Product criticism
> is more useful than money, but the optional 500 USDT hardening milestone and
> exact budget are public.

## Next Reddit update

**Title**

Unstash 0.1: a private tab-to-action queue with one Chromium permission

**Body**

This is an update to my own project. The first Unstash prototype required
pasting saved links or importing Reddit CSV files. The new Chromium developer
preview captures the active tab, asks what happens next—Read / Make / Keep—and
sends it to the local queue.

The manifest requests only `activeTab`, which is granted when the extension
icon is clicked. It has no host permissions, content script, background
service, Reddit login or remote vault. The URL and title travel in a URL
fragment that is not sent in the HTTP request and is cleared after local
import.

What works now:

- local import of Reddit's saved-post and saved-comment CSV files;
- one-click active-tab capture in Chromium browsers;
- manual link capture;
- action labels, search, completion and Markdown export;
- no account or remote queue database.

Demo: https://unstash-open.vercel.app/unstash-demo.mp4

Prototype: https://unstash-open.vercel.app/prototype

Release: https://github.com/unstash-open/unstash/releases/tag/v0.1.0

Source: https://github.com/unstash-open/unstash

Would `activeTab` be acceptable for a tool like this, or would you still prefer
the zero-permission CSV route?

## Reply rules

- Answer the product or privacy question before mentioning funding.
- Be explicit that both CSV import and extension 0.1 are shipped.
- Do not introduce funding in the post or replies unless someone explicitly asks.
- Never imply users, contributors or donations that do not exist.
- If removed, ask moderators once for the rule or reason, then stop.
- Do not repost the same text in another subreddit.
