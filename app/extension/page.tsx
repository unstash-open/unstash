import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT } from "../../lib/project";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Unstash Capture 0.1",
  description:
    "Install the permission-light Unstash browser extension developer preview and send the active tab to your private local queue.",
  alternates: {
    canonical: "/extension",
  },
  openGraph: {
    type: "website",
    title: "Unstash Capture 0.1 — one permission, private by default",
    description:
      "Capture the active tab into a private local queue with activeTab only and no host permissions.",
    url: "/extension",
    siteName: "Unstash",
    images: [
      {
        url: "/og-extension.png",
        width: 1536,
        height: 1024,
        alt: "Unstash Capture 0.1 — save the tab and pick what happens next",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstash Capture 0.1",
    description: "One permission. Private by default.",
    images: ["/og-extension.png"],
  },
};

const installSteps = [
  ["01", "Download and unzip", "Get the 0.1 ZIP and unpack it anywhere on your device."],
  ["02", "Open extensions", "Open chrome://extensions in Chrome, Brave or Edge."],
  ["03", "Load unpacked", "Enable Developer mode and select the unzipped extension folder."],
  ["04", "Capture a tab", "Pin Unstash, choose Read / Make / Keep and add the active tab."],
];

const privacyFacts = [
  ["One permission", "activeTab is granted only after you click the extension icon."],
  ["No host access", "The manifest requests no access to websites in the background."],
  ["No remote vault", "The capture lands in browser local storage on the prototype page."],
  ["No URL upload", "Capture data travels in a URL fragment, which is cleared after import."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Unstash Capture",
  description:
    "A permission-light Chromium extension that sends the active tab to a private local-first action queue.",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Chrome, Brave, Edge",
  softwareVersion: "0.1.0",
  isAccessibleForFree: true,
  downloadUrl: `${PROJECT.siteUrl}/unstash-extension-v0.1.0.zip`,
  installUrl: `${PROJECT.siteUrl}/extension`,
  codeRepository: `${PROJECT.sourceUrl}/tree/main/extension`,
  releaseNotes: PROJECT.releaseUrl,
  permissions: "activeTab",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function ExtensionPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <SiteHeader />
      <main className="extension-main">
        <section className="extension-hero shell">
          <div className="extension-hero-copy">
            <div className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              Developer preview · v0.1.0
            </div>
            <h1>Save the tab. Pick what happens next.</h1>
            <p>
              Unstash Capture sends the current page into your private local
              queue. It asks for one temporary permission, reads only the tab
              you chose and keeps the URL out of server requests.
            </p>
            <div className="hero-actions">
              <a
                className="button button-dark"
                download
                href="/unstash-extension-v0.1.0.zip"
              >
                Download extension 0.1
                <span aria-hidden="true">↓</span>
              </a>
              <Link className="button button-ghost" href="/prototype">
                Open the local queue
              </Link>
            </div>
            <p className="microcopy">
              Chromium developer preview · manual install · source included
            </p>
            <p className="extension-checksum">
              <span>SHA-256</span>
              <code>da13e0648f3984556144bb281346c8bb26c55f565cae7d06a70ac1d15ba326d3</code>
            </p>
          </div>

          <div className="extension-popup-preview" aria-label="Preview of Unstash Capture">
            <div className="extension-popup-header">
              <span className="brand-mark" aria-hidden="true">U</span>
              <div>
                <strong>unstash</strong>
                <small>capture 0.1</small>
              </div>
            </div>
            <div className="extension-popup-card">
              <span>Current tab</span>
              <h2>A practical guide I want to use</h2>
              <p>example.com/practical-guide</p>
            </div>
            <label>What happens next?</label>
            <div className="extension-fake-select">
              <span>Make</span>
              <span aria-hidden="true">⌄</span>
            </div>
            <div className="extension-fake-button">
              <span>Add to my private queue</span>
              <span aria-hidden="true">→</span>
            </div>
            <p className="extension-popup-note">
              No host access · no account · no remote vault
            </p>
          </div>
        </section>

        <section className="extension-proof">
          <div className="shell">
            <div className="section-heading">
              <div>
                <div className="section-kicker">01 · PERMISSION NOTES</div>
                <h2>Small permission. Visible handoff.</h2>
              </div>
              <p>
                The developer preview does one narrow job. There is no
                background listener, content script, account access or remote
                database.
              </p>
            </div>
            <div className="extension-facts">
              {privacyFacts.map(([title, copy], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="extension-install shell">
          <div className="section-kicker">02 · INSTALL IN TWO MINUTES</div>
          <div className="extension-steps">
            {installSteps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="extension-limit">
            <div>
              <span className="status-pill">KNOWN LIMITS</span>
              <h2>A real release, still a developer preview.</h2>
              <p>
                Version 0.1 is manually installed and targets Chromium browsers.
                The next hardening milestone covers Firefox packaging,
                automated browser tests, failure recovery and store-ready
                documentation.
              </p>
            </div>
            <div className="extension-release-links">
              <a
                className="text-link"
                href={PROJECT.releaseUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open official release <span aria-hidden="true">↗</span>
              </a>
              <a
                className="text-link"
                href={`${PROJECT.sourceUrl}/tree/main/extension`}
                rel="noreferrer"
                target="_blank"
              >
                Inspect extension source <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
