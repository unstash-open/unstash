import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { VaultPrototype } from "./vault-prototype";

export const metadata: Metadata = {
  title: "Try the local-first prototype",
  description:
    "Add a link, choose Read, Make or Keep, and export your private queue to Markdown. No account or tracking.",
  alternates: {
    canonical: "/prototype",
  },
  openGraph: {
    type: "website",
    title: "Unstash — turn saved links into next steps",
    description:
      "Try the local-first queue for links you meant to use. No account, no tracking, and data stays in your browser.",
    url: "/prototype",
    siteName: "Unstash",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Unstash — saved does not mean used",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstash — turn saved links into next steps",
    description:
      "A private, local-first queue for the links you meant to use.",
    images: ["/og.png"],
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
      "Local browser storage",
      "Queue search and completion",
      "Markdown export",
      "No account or tracking",
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
          <h1>Turn a saved link into a next step.</h1>
          <p>
            Add a link, decide what you want to do with it and keep a small
            searchable queue. This prototype stores everything in this browser only.
          </p>
        </section>
        <VaultPrototype />
      </main>
    </div>
  );
}
