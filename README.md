# Unstash

Unstash is a local-first queue for turning saved posts and links into concrete
next steps. The current prototype runs entirely in the browser: no account, no
tracking and no remote database.

Live project: **https://unstash-open.vercel.app**

The project is being built in public through a voluntary 10,000 USDT campaign.
Read [FUNDING.md](./FUNDING.md) before contributing. Launch ops and Plan B
channels: [docs/OPERATIONS.md](./docs/OPERATIONS.md),
[docs/CHANNEL_LAUNCH.md](./docs/CHANNEL_LAUNCH.md).

## What works today

- add any saved link with a `read`, `make` or `keep` action;
- search and complete queue items;
- export the queue as Markdown;
- keep all prototype data in browser local storage;
- verify the funding wallet and total independently on-chain.

## Roadmap

1. Harden the local vault and import/export.
2. Add a browser extension and permission-light Reddit OAuth import.
3. Add on-device search, resurfacing and optional local summaries.
4. Complete cross-browser QA, accessibility review and the v1 release.

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
