import Link from "next/link";
import { PROJECT } from "../../lib/project";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

type BetaOutcomeProps = {
  eyebrow: string;
  title: string;
  copy: string;
  nextLabel: string;
  nextHref: string;
};

export function BetaOutcome({
  eyebrow,
  title,
  copy,
  nextLabel,
  nextHref,
}: BetaOutcomeProps) {
  return (
    <>
      <SiteHeader />
      <main className="beta-outcome shell">
        <section>
          <div className="eyebrow">
            <span className="live-dot" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1>{title}</h1>
          <p>{copy}</p>
          <div className="hero-actions">
            <Link className="button button-dark" href={nextHref}>
              {nextLabel} <span aria-hidden="true">→</span>
            </Link>
            <a
              className="button button-ghost"
              href={PROJECT.feedbackUrl}
              rel="noreferrer"
              target="_blank"
            >
              Add optional detail <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="microcopy">
            This page visit is the signal. No saved link, queue content or
            personal identifier was included.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
