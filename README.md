# Unstash

Unstash is a local-first queue for turning saved posts and links into concrete
next steps. The current prototype runs entirely in the browser: no account, no
tracking and no remote database.

Live project: **https://unstash-open.vercel.app**

The active public milestone is **500 USDT** for a permission-light Reddit
saved-post import prototype. The broader **10,000 USDT** roadmap remains a
transparent stretch plan, not a requirement to start shipping. Read
[FUNDING.md](./FUNDING.md) before contributing. Launch operations and channel
drafts live in [docs/OPERATIONS.md](./docs/OPERATIONS.md),
[docs/CHANNEL_LAUNCH.md](./docs/CHANNEL_LAUNCH.md) and
[docs/MILESTONE_LAUNCH.md](./docs/MILESTONE_LAUNCH.md).

## What works today

- add any saved link with a `read`, `make` or `keep` action;
- search and complete queue items;
- export the queue as Markdown;
- keep all prototype data in browser local storage;
- verify the funding wallet and total independently on-chain.

## Roadmap

1. **0–500 USDT:** prototype a permission-light Reddit saved-post import.
2. **500–2,000 USDT:** harden the browser extension and import flow.
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
