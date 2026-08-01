# Unstash

Unstash is a local-first queue for turning saved posts and links into concrete
next steps. The current prototype runs entirely in the browser with no account
or remote queue database.

Live project: **https://unstash-open.vercel.app**

Permission-free Reddit CSV import and the Chromium extension developer preview
have shipped. The active public milestone is **500 USDT** for cross-browser
hardening, automated tests and store-ready packaging. The broader **10,000
USDT** roadmap remains a transparent stretch plan, not a requirement to start
shipping. Read
[FUNDING.md](./FUNDING.md) before contributing. Launch operations and channel
drafts live in [docs/OPERATIONS.md](./docs/OPERATIONS.md),
[docs/CHANNEL_LAUNCH.md](./docs/CHANNEL_LAUNCH.md) and
[docs/MILESTONE_LAUNCH.md](./docs/MILESTONE_LAUNCH.md).
Extension permissions, limits and the release checksum are recorded in
[docs/EXTENSION_0.1.md](./docs/EXTENSION_0.1.md).

The repository also includes a separately scoped, paid repository security
review at `/security-audit`. Checkout, authorization boundaries and fulfillment
operations are documented in
[docs/SECURITY_AUDIT_REVENUE.md](./docs/SECURITY_AUDIT_REVENUE.md).

The [29-second demo](https://unstash-open.vercel.app/unstash-demo.mp4) uses
AI-generated title art and a natural conversational AI voice over real product
screens. No camera, microphone or personal account footage is used.

## What works today

- add any saved link with a `read`, `make` or `keep` action;
- capture the active tab with the installable Chromium extension 0.1;
- import `saved_posts.csv` and `saved_comments.csv` locally with no Reddit login;
- search and complete queue items;
- export the queue as Markdown;
- keep all prototype data in browser local storage;
- verify the funding wallet and total independently on-chain.

## Roadmap

1. **0–500 USDT:** harden extension 0.1 for cross-browser release.
2. **500–2,000 USDT:** add resilient live capture and store packaging.
3. **2,000–5,000 USDT:** add useful on-device resurfacing and summaries.
4. **5,000–10,000 USDT:** complete cross-browser QA, accessibility and v1.

## Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
npm test
npm run package:extension
```

The application uses Next-compatible React through vinext and targets a
Cloudflare Worker runtime.

## Privacy

The prototype stores items under `unstash-prototype-v1` in local storage. It
does not submit saved links to an application server. The public site uses
cookie-free Vercel Web Analytics for anonymous route-level page counts and
referrers. Query strings and URL fragments are removed before page-view events
are sent; no custom event properties, saved links or queue contents are
collected. The campaign panel also calls the read-only total endpoint, which
queries public blockchain data.

Extension 0.1 requests only `activeTab`. It passes the selected tab to the
prototype in a URL fragment; fragments are not included in HTTP requests and
the prototype clears the fragment immediately after importing the capture.

## License

MIT. See [LICENSE](./LICENSE).
