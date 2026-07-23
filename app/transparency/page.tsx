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

export default function TransparencyPage() {
  return (
    <>
      <SiteHeader />
      <main className="transparency-main shell">
        <section className="page-hero">
          <div className="section-kicker">Public funding policy</div>
          <h1>Every contribution has a visible job.</h1>
          <p>
            This page defines what counts toward the 10,000 USDT target, how the
            funds may be used and what contributors should—and should not—expect.
          </p>
        </section>

        <section className="transparency-grid">
          <DonationPanel />
          <div>
            <div className="section-kicker">Budget · 10,000 USDT</div>
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
