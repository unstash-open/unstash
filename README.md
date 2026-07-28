# Unstash

Unstash is a local-first queue for turning saved posts and links into concrete
next steps. The current prototype runs entirely in the browser: no account, no
tracking and no remote database.

Live project: **https://unstash-open.vercel.app**

Permission-free Reddit CSV import has shipped. The active public milestone is
**500 USDT** for extension hardening and live-save capture. The broader
**10,000 USDT** roadmap remains a transparent stretch plan, not a requirement
to start shipping. Read
[FUNDING.md](./FUNDING.md) before contributing. Launch operations and channel
drafts live in [docs/OPERATIONS.md](./docs/OPERATIONS.md),
[docs/CHANNEL_LAUNCH.md](./docs/CHANNEL_LAUNCH.md) and
[docs/MILESTONE_LAUNCH.md](./docs/MILESTONE_LAUNCH.md).

The [29-second demo](https://unstash-open.vercel.app/unstash-demo.mp4) uses
AI-generated title art and a synthetic voice over real product screens. No
camera, microphone or personal account footage is used.

## What works today

- add any saved link with a `read`, `make` or `keep` action;
- import `saved_posts.csv` and `saved_comments.csv` locally with no Reddit login;
- search and complete queue items;
- export the queue as Markdown;
- keep all prototype data in browser local storage;
- verify the funding wallet and total independently on-chain.

## Roadmap

1. **0–500 USDT:** harden the permission-light extension and import flow.
2. **500–2,000 USDT:** add live-save capture and cross-browser packaging.
3. **2,000–5,000 USDT:** add useful on-device resurfacing and summaries.
4. **5,000–10,000 USDT:** complete cross-browser QA, accessibility and v1.

## Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
npm test
```

The application uses Next-compatible React through vinext and targets a
Cloudflare Worker runtime.

## Privacy

The prototype stores items under `unstash-prototype-v1` in local storage. It
does not submit saved links to an application server. The only automatic
external request is the read-only campaign total endpoint, which queries public
blockchain data.

## License

MIT. See [LICENSE](./LICENSE).
