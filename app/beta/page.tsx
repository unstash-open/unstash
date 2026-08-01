import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "5-minute activation test",
  description:
    "Turn one forgotten save into one finished action in a private, local-first Unstash test. No signup or remote vault.",
  alternates: {
    canonical: "/beta",
  },
};

const testSteps = [
  {
    number: "01",
    title: "Bring one real save",
    copy: "Paste a forgotten link, capture the current tab or import a Reddit CSV. Your data stays in this browser.",
  },
  {
    number: "02",
    title: "Name the smallest action",
    copy: "Choose Read, Make or Keep and write a concrete next step you can finish now.",
  },
  {
    number: "03",
    title: "Do it and answer once",
    copy: "Mark the save Done, then choose useful, not yet or privacy concern. No account and no essay.",
  },
];

export default function BetaPage() {
  return (
    <>
      <SiteHeader />
      <main className="beta-page shell">
        <section className="beta-hero">
          <div>
            <div className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              14-day validation · live product
            </div>
            <h1>Turn one forgotten save into one finished action.</h1>
            <p>
              Unstash does not need another waitlist. It needs evidence that a
              saved link becomes more useful when it has one explicit next step.
              This guided test takes about five minutes.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/beta/run">
                Start with one real save <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button-ghost" href="/prototype">
                Explore without the guide
              </Link>
            </div>
            <p className="microcopy">
              No signup. No email. No saved-link upload. Query strings are
              removed before anonymous page analytics are sent.
            </p>
          </div>

          <aside className="beta-scorecard" aria-label="Validation targets">
            <span className="status-pill">PASS / PAUSE RULE</span>
            <h2>What counts as traction?</h2>
            <dl>
              <div>
                <dt>5</dt>
                <dd>independent test starts</dd>
              </div>
              <div>
                <dt>3</dt>
                <dd>saves marked Done</dd>
              </div>
              <div>
                <dt>2</dt>
                <dd>“worth resurfacing” signals</dd>
              </div>
            </dl>
            <p>
              If the test misses those numbers, the next move is to change the
              problem or positioning—not add more features.
            </p>
          </aside>
        </section>

        <section className="beta-steps" aria-labelledby="beta-steps-title">
          <div className="section-kicker">THE WHOLE TEST</div>
          <h2 id="beta-steps-title">One save. Three steps. One honest signal.</h2>
          <div className="beta-step-grid">
            {testSteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="beta-privacy">
          <div>
            <div className="section-kicker">MEASUREMENT WITHOUT SURVEILLANCE</div>
            <h2>The result is counted. Your save is not.</h2>
          </div>
          <p>
            Route-level page counts tell us whether someone started and which
            final answer they chose. Unstash never sends the saved URL, title,
            queue contents, CSV data or browser storage. Detailed feedback is
            optional and public on GitHub.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
