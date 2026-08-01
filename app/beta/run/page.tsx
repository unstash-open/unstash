import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { VaultPrototype } from "../../prototype/vault-prototype";

export const metadata: Metadata = {
  title: "Run the 5-minute beta",
  description:
    "Complete one saved-link action in the guided, local-first Unstash beta.",
  robots: { index: false, follow: true },
};

export default function BetaRunPage() {
  return (
    <div className="prototype-page">
      <SiteHeader />
      <main className="prototype-shell shell">
        <section className="page-hero beta-run-hero">
          <div className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Guided activation test
          </div>
          <h1>Use one real save. Finish one real action.</h1>
          <p>
            Your queue stays in this browser. When you mark one save Done, the
            guide asks for a single anonymous outcome—no signup or written review.
          </p>
        </section>
        <VaultPrototype guided />
      </main>
    </div>
  );
}
