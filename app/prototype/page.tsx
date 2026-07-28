import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { VaultPrototype } from "./vault-prototype";

export const metadata: Metadata = {
  title: "Import Reddit saves locally",
  description:
    "Import Reddit saved-post CSV files locally, choose Read, Make or Keep, and export your private queue without an account or remote vault.",
  alternates: {
    canonical: "/prototype",
  },
  openGraph: {
    type: "website",
    title: "Unstash — turn saved links into next steps",
    description:
      "Import Reddit saves into a local-first action queue. Queue data stays in your browser.",
    url: "/prototype",
    siteName: "Unstash",
    images: [
      {
        url: "/og-reddit-import.png",
        width: 1536,
        height: 1024,
        alt: "Unstash — Reddit import is live, private and local-first",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstash — turn saved links into next steps",
    description:
      "Import Reddit saves into a private, local-first action queue.",
    images: ["/og-reddit-import.png"],
  },
};

export default function PrototypePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Unstash",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any modern web browser",
    isAccessibleForFree: true,
    description:
      "A private, local-first queue that turns saved links into clear next steps.",
    featureList: [
      "Read, Make and Keep action labels",
      "Permission-free Reddit CSV import",
      "Permission-light active-tab capture",
      "Local browser storage",
      "Queue search and completion",
      "Markdown export",
      "No account or remote queue storage",
    ],
    url: "https://unstash-open.vercel.app/prototype",
    codeRepository: "https://github.com/unstash-open/unstash",
  };

  return (
    <div className="prototype-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader />
      <main className="prototype-shell shell">
        <section className="page-hero">
          <div className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Working local prototype
          </div>
          <h1>Import Reddit saves without signing in.</h1>
          <p>
            Bring in saved posts and comments from Reddit&apos;s official CSV
            export, choose a next action and keep a searchable queue. Everything
            is read and stored only in this browser.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/extension">
              Install extension 0.1 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
        <VaultPrototype />
      </main>
    </div>
  );
}
