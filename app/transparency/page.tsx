import type { Metadata } from "next";
import { DonationPanel } from "../components/DonationPanel";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Funding transparency",
  description:
    "The Unstash campaign budget, wallet accounting rules and contributor promise.",
};

const budget = [
  ["Core product development", "Local vault, import/export, data model and release engineering.", "3,200"],
  ["Browser extension + Reddit import", "Permission-light extension and OAuth integration.", "2,200"],
  ["Search + resurfacing", "On-device indexing, daily queue and optional local summaries.", "1,650"],
  ["Design + accessibility", "Interaction design, keyboard support and accessibility review.", "1,100"],
  ["Testing + security", "Cross-browser QA, dependency review and privacy verification.", "900"],
  ["Infrastructure + documentation", "Hosting, domain, status tooling and contributor guides.", "600"],
  ["Contingency", "A capped buffer for unexpected project costs.", "350"],
];

const activeMilestoneBudget = [
  ["Extension scaffold", "Minimal browser-extension shell and local import flow.", "180"],
  ["Import mapping", "Saved-post parsing, deduplication and local queue mapping.", "160"],
  ["Permission documentation", "Public threat notes and a readable permission rationale.", "80"],
  ["Cross-browser testing", "Chrome-family and Firefox packaging smoke tests.", "60"],
  ["Milestone buffer", "A capped allowance for unexpected integration work.", "20"],
];

export default function TransparencyPage() {
  return (
    <>
      <SiteHeader />
      <main className="transparency-main shell">
        <section className="page-hero">
          <div className="section-kicker">Public funding policy</div>
          <h1>Every contribution has a visible job.</h1>
          <p>
            The active target is 500 USDT for a permission-light Reddit import
            prototype. This page also defines the broader 10,000 USDT roadmap,
            accounting rules and contributor expectations.
          </p>
        </section>

        <section className="transparency-grid">
          <DonationPanel />
          <div>
            <div className="section-kicker">Active milestone · 500 USDT</div>
            <div className="budget-table">
              {activeMilestoneBudget.map(([title, copy, amount]) => (
                <div className="budget-row" key={title}>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <strong>{amount}</strong>
                </div>
              ))}
            </div>
            <p className="budget-note">
              Delivery target: a public prototype within 7 days after this
              milestone is fully funded. Scope and source changes are published
              openly.
            </p>
          </div>
        </section>

        <section className="roadmap-budget">
          <div className="section-kicker">Stretch roadmap · 10,000 USDT</div>
          <div className="budget-table">
            {budget.map(([title, copy, amount]) => (
              <div className="budget-row" key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <strong>{amount}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="policy-stack">
          <article className="policy-card">
            <span>ACCOUNTING</span>
            <h3>Incoming transfers after launch.</h3>
            <p>
              The live total counts confirmed incoming USDT transfers to the
              published TRC20 and ERC20 wallets after the campaign cutoff. The
              corresponding block explorers are the sources of truth.
            </p>
          </article>
          <article className="policy-card">
            <span>DELIVERY</span>
            <h3>Milestones, not an all-or-nothing promise.</h3>
            <p>
              Work is released in funded increments. A weekly public update will
              record shipped work, spending and any material change in scope.
            </p>
          </article>
          <article className="policy-card">
            <span>TERMS</span>
            <h3>Support, not investment.</h3>
            <p>
              A contribution grants no equity, token, governance right,
              repayment, profit or tax deduction. Crypto transfers are final and
              cannot be refunded automatically.
            </p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
