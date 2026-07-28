# Unstash Capture 0.1 release notes

Released: **2026-07-28**

Download:
**https://unstash-open.vercel.app/unstash-extension-v0.1.0.zip**

SHA-256:
`da13e0648f3984556144bb281346c8bb26c55f565cae7d06a70ac1d15ba326d3`

## Shipped

- Manifest V3 Chromium developer preview;
- active-tab URL and title capture;
- Read / Make / Keep action selection;
- local import into the existing Unstash queue;
- duplicate protection;
- public source, permission notes and reproducible ZIP packaging.

## Permission model

The manifest requests only `activeTab`. It defines no host permissions,
background service worker or content script.

The selected tab is encoded into the fragment of the Unstash prototype URL.
URL fragments are not included in HTTP requests. The prototype validates the
payload, stores it in browser local storage and clears the fragment with
`history.replaceState`.

## Known limits

- manual installation through Chromium Developer mode;
- no Firefox package yet;
- no signed Chrome Web Store release;
- the queue stays within the current browser profile and origin;
- captures open the prototype in a new tab.
