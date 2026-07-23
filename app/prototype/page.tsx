import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { VaultPrototype } from "./vault-prototype";

export const metadata: Metadata = {
  title: "Private prototype",
  description:
    "Try the local-first Unstash prototype. Your links stay in this browser.",
};

export default function PrototypePage() {
  return (
    <div className="prototype-page">
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
