import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT } from "../../lib/project";
import { SECURITY_AUDIT_PLANS } from "../../lib/security-audit";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Human-verified repository security audit",
  description:
    "A paid, authorization-gated GitHub repository security review with human validation, remediation guidance and an optional monthly monitor.",
  alternates: { canonical: `${PROJECT.siteUrl}/security-audit` },
  openGraph: {
    title: "Repository security review · Unstash",
    description:
      "Turn scanner noise into confirmed, reproducible findings before the next release.",
    url: `${PROJECT.siteUrl}/security-audit`,
    images: [`${PROJECT.siteUrl}/og-launch.jpg`],
  },
};

const reviewSteps = [
  ["01", "Confirm authorization", "We record the repository, immutable commit, allowed techniques and explicit scope before any scan runs."],
  ["02", "Map the attack surface", "We inventory the complete repository and trace trust boundaries, entry points, sensitive sinks, dependencies and CI workflows."],
  ["03", "Validate the strongest leads", "A human reviewer rejects false positives and reproduces credible issues locally with synthetic data."],
  ["04", "Ship a decision-ready report", "You receive evidence, impact, remediation direction and regression-test guidance without live secrets or production exploitation."],
];

const differentiators = [
  ["Not another alert feed", "Deterministic matches remain triage leads until attacker control, reachability, a missing control and concrete impact are established."],
  ["Scope is enforced", "Payment does not authorize testing. Owner approval or an official bug bounty policy is required before analysis begins."],
  ["Built for remediation", "Confirmed findings include affected code, a minimal local reproduction and a testable fix direction."],
];

export default function SecurityAuditPage() {
  const plans = Object.values(SECURITY_AUDIT_PLANS);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Human-verified GitHub repository security audit",
    provider: { "@type": "Organization", name: PROJECT.name, url: PROJECT.siteUrl },
    areaServed: "Worldwide",
    serviceType: "Application security review",
    url: `${PROJECT.siteUrl}/security-audit`,
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      priceCurrency: "USD",
      price: (plan.priceCents / 100).toFixed(2),
      url: `${PROJECT.siteUrl}/security-audit/intake?plan=${plan.id}`,
    })),
  };

  return (
    <>
      <SiteHeader />
      <main className="audit-main">
        <section className="audit-hero shell">
          <div className="audit-hero-copy">
            <div className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              Paid repository security review
            </div>
            <h1>
              Ship with fewer
              <span> unknowns.</span>
            </h1>
            <p>
              A human-verified GitHub repository audit for small engineering
              teams that need actionable evidence, not another dashboard full
              of untriaged alerts.
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/security-audit/intake?plan=beta">
                Book the $490 audit <span aria-hidden="true">→</span>
              </Link>
              <a className="button button-ghost" href="#how-it-works">
                See the review process
              </a>
            </div>
            <p className="microcopy">
              One repository · local proofs only · no production exploitation ·
              refund before review if authorization cannot be verified
            </p>
          </div>
          <div className="audit-proof-card" aria-label="What the paid audit delivers">
            <span className="status-pill">HUMAN-VERIFIED DELIVERY</span>
            <h2>From repository to remediation.</h2>
            <ol>
              <li><span>Scope</span><strong>Authorization contract</strong></li>
              <li><span>Coverage</span><strong>Full repository inventory</strong></li>
              <li><span>Evidence</span><strong>Locally reproduced findings</strong></li>
              <li><span>Fix</span><strong>Regression-test guidance</strong></li>
            </ol>
            <div className="audit-proof-footer">
              <span>Starting at</span>
              <strong>$490</strong>
            </div>
          </div>
        </section>

        <section className="audit-trust-strip" aria-label="Service boundaries">
          <div className="shell">
            <span>OWNER-AUTHORIZED</span><i>✦</i>
            <span>SECRET-REDACTED</span><i>✦</i>
            <span>LOCAL REPRODUCTION</span><i>✦</i>
            <span>HUMAN TRIAGE</span>
          </div>
        </section>

        <section className="audit-section shell" id="how-it-works">
          <div className="audit-section-heading">
            <div>
              <div className="section-kicker">01 · THE REVIEW</div>
              <h2>Evidence before severity.</h2>
            </div>
            <p>
              The agent accelerates coverage. A human reviewer decides what is
              reachable, reproducible and worth fixing.
            </p>
          </div>
          <div className="audit-steps">
            {reviewSteps.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="audit-dark-section">
          <div className="shell">
            <div className="audit-section-heading inverse">
              <div>
                <div className="section-kicker">02 · THE DIFFERENCE</div>
                <h2>Scanner speed. Reviewer judgment.</h2>
              </div>
              <p>
                The paid outcome is a smaller set of defensible decisions, not
                the largest possible list of warnings.
              </p>
            </div>
            <div className="audit-difference-grid">
              {differentiators.map(([title, copy], index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="audit-section shell" id="pricing">
          <div className="audit-section-heading">
            <div>
              <div className="section-kicker">03 · PRICING</div>
              <h2>Start with one repository.</h2>
            </div>
            <p>
              Fixed prices keep the first engagement easy to approve. Scope is
              confirmed before work begins.
            </p>
          </div>
          <div className="audit-pricing-grid">
            {plans.map((plan) => (
              <article className={plan.id === "standard" ? "featured" : ""} key={plan.id}>
                <div>
                  <span className="audit-plan-name">{plan.shortName}</span>
                  {plan.id === "standard" ? <em>RECOMMENDED</em> : null}
                </div>
                <div className="audit-price">
                  <strong>{plan.priceLabel}</strong>
                  <span>{plan.cadenceLabel}</span>
                </div>
                <p>{plan.description}</p>
                <ul>
                  {plan.deliverables.map((deliverable) => (
                    <li key={deliverable}><span aria-hidden="true">✓</span>{deliverable}</li>
                  ))}
                </ul>
                <Link className="button button-dark" href={`/security-audit/intake?plan=${plan.id}`}>
                  Choose {plan.shortName.toLowerCase()} <span aria-hidden="true">→</span>
                </Link>
                <small>{plan.turnaround} after authorization and access are confirmed.</small>
              </article>
            ))}
          </div>
        </section>

        <section className="audit-section shell audit-faq">
          <div className="audit-section-heading">
            <div>
              <div className="section-kicker">04 · STRAIGHT ANSWERS</div>
              <h2>Know what you are buying.</h2>
            </div>
          </div>
          <div className="faq-list">
            <details>
              <summary>Do you guarantee that an audit finds a vulnerability?</summary>
              <p>No. The service guarantees the documented review scope and deliverables, not a vulnerability count or severity.</p>
            </details>
            <details>
              <summary>Will you attack our production application?</summary>
              <p>No. The default service is offline source review and local reproduction with synthetic data. Production testing needs separate, explicit written authorization.</p>
            </details>
            <details>
              <summary>Can you review a public bug bounty repository?</summary>
              <p>Only when the current program policy explicitly lists the repository or source-code review as in scope. Public source code alone is not authorization.</p>
            </details>
            <details>
              <summary>What happens if our scope cannot be verified?</summary>
              <p>We stop before analysis and refund the payment. Payment itself never expands the authorized testing scope.</p>
            </details>
          </div>
        </section>

        <section className="audit-final-cta">
          <div className="shell">
            <div>
              <span className="status-pill">ONE REPOSITORY · FIXED SCOPE</span>
              <h2>Make the next release easier to defend.</h2>
            </div>
            <Link className="button button-light" href="/security-audit/intake?plan=beta">
              Start the paid intake <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        id="security-audit-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
