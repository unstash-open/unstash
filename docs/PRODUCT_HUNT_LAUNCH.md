# Product Hunt launch pack

Use a neutral Product Hunt maker profile named **Unstash Open**. Do not connect
or expose a personal profile. Keep the launch product-first: no wallet address,
funding goal, investment language, vote request, or invented traction.

## Listing fields

- **Name:** Unstash
- **Tagline:** Turn saved links into one clear next step
- **Website:** https://unstash-open.vercel.app/
- **Status:** Available now
- **Pricing:** Free and open source
- **Topics:** Productivity, Open Source, Chrome Extensions
- **Source:** https://github.com/unstash-open/unstash

**Description**

Unstash is a private, local-first queue for links you meant to use. Capture one
tab or import a Reddit CSV, choose Read / Make / Keep, search the queue, finish
items, and export Markdown. No account or remote vault. The Chromium preview
uses only `activeTab`, with no host permissions, content script, or background
service.

## Gallery order

1. `public/og-launch.jpg` — product promise and three-action workflow.
2. `public/og-extension.png` — active-tab capture and permission model.
3. `public/og-reddit-import.png` — permission-free local Reddit CSV import.

Use `public/product-hunt-icon.png` as the square product icon. Do not use the
older `public/og.png` in the launch gallery because it contains an outdated
milestone label.

The existing demo is public at
https://unstash-open.vercel.app/unstash-demo.mp4. Add it to Product Hunt only if
the current form accepts a direct video URL; do not create a misleading trailer
or imply human narration.

## Maker comment

Unstash is our own open-source project. It started with a simple frustration:
saved links kept becoming a graveyard, while folders only made the graveyard
tidier.

The current build forces one small decision at capture time: **Read**, **Make**,
or **Keep**. Everything stays in the browser. The Chromium preview asks for one
temporary permission, `activeTab`, and has no host permissions, content script,
or background service. People who prefer zero extension permissions can import
Reddit's official CSV export locally instead.

What is live today:

- active-tab capture;
- local Reddit CSV import;
- search, completion, and Markdown export;
- a usable browser prototype and public source.

The question we most want answered is not “do you like it?” It is: **is
`activeTab` acceptable for this workflow, or should capture stay CSV-only?** If
you try it, the first confusing or unnecessary step is the most useful feedback.

## Launch conduct

- Do not ask for upvotes or coordinate artificial voting.
- Do not invent users, installs, donations, testimonials, or rankings.
- Answer product and privacy questions before anything else.
- Disclose that the demo uses an AI-produced voice if asked.
- Keep the voluntary support page out of the listing and maker comment unless a
  user independently asks how development is funded.
