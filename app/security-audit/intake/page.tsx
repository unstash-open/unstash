import type { Metadata } from "next";
import Link from "next/link";
import { getSecurityAuditPlan, SECURITY_AUDIT_PLANS } from "../../../lib/security-audit";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Start a repository security audit",
  description: "Confirm scope and continue to secure checkout for a human-verified repository audit.",
  robots: { index: false, follow: false },
};

type IntakePageProps = {
  searchParams: Promise<{ plan?: string; status?: string }>;
};

const statusMessages: Record<string, string> = {
  cancelled: "Checkout was cancelled. Your repository has not been queued or charged.",
  "checkout-error": "Polar could not start checkout. Please try again in a moment.",
  "checkout-unavailable": "Checkout is being connected. No payment was taken; contact us before sharing private access.",
  received: "Request received. Automated submissions are not processed.",
};

export default async function SecurityAuditIntakePage({ searchParams }: IntakePageProps) {
  const params = await searchParams;
  const selectedPlan = getSecurityAuditPlan(params.plan);
  const statusMessage = params.status ? statusMessages[params.status] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="audit-intake-main">
        <section className="audit-intake shell">
          <div className="audit-intake-copy">
            <div className="section-kicker">SECURE INTAKE · STEP 1 OF 2</div>
            <h1>Confirm the repository and authorization.</h1>
            <p>
              We use these details to bind payment to one repository and verify
              scope before review. Do not paste source code, credentials or user data.
            </p>
            <article className="audit-intake-plan">
              <span>{selectedPlan.name}</span>
              <strong>{selectedPlan.priceLabel}</strong>
              <small>{selectedPlan.cadenceLabel} · {selectedPlan.turnaround}</small>
              <ul>
                {selectedPlan.deliverables.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <Link className="text-link" href="/security-audit#pricing">
              Compare all plans <span aria-hidden="true">→</span>
            </Link>
          </div>

          <form className="audit-intake-form" action="/api/security-audit/checkout" method="post">
            {statusMessage ? <p className="audit-form-status" role="status">{statusMessage}</p> : null}
            <div className="form-field">
              <label htmlFor="plan">Plan</label>
              <select id="plan" name="plan" defaultValue={selectedPlan.id}>
                {Object.values(SECURITY_AUDIT_PLANS).map((plan) => (
                  <option value={plan.id} key={plan.id}>
                    {plan.name} — {plan.priceLabel} {plan.cadenceLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="audit-form-row">
              <div className="form-field">
                <label htmlFor="email">Business email</label>
                <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
              </div>
              <div className="form-field">
                <label htmlFor="company">Company or team</label>
                <input id="company" name="company" autoComplete="organization" maxLength={120} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="repository">GitHub repository URL</label>
              <input
                id="repository"
                name="repository"
                type="url"
                inputMode="url"
                placeholder="https://github.com/owner/repository"
                pattern="https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?/?"
                maxLength={300}
                required
              />
              <small>Private repositories are connected only after payment and scope verification.</small>
            </div>
            <div className="form-field">
              <label htmlFor="policyUrl">Bug bounty or authorization policy URL <span>optional</span></label>
              <input
                id="policyUrl"
                name="policyUrl"
                type="url"
                inputMode="url"
                placeholder="https://example.com/security"
                maxLength={500}
              />
            </div>
            <div className="form-field">
              <label htmlFor="scopeNotes">Scope notes <span>optional</span></label>
              <textarea
                id="scopeNotes"
                name="scopeNotes"
                rows={4}
                maxLength={500}
                placeholder="Deployment model, languages, deadline, explicitly excluded components…"
              />
            </div>
            <div className="audit-honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="audit-checkbox">
              <input type="checkbox" name="authorization" value="confirmed" required />
              <span>I own this repository or have written authorization from its owner or an applicable bug bounty program.</span>
            </label>
            <label className="audit-checkbox">
              <input type="checkbox" name="terms" value="accepted" required />
              <span>
                I accept the <Link href="/security-audit/terms" target="_blank">service terms</Link> and
                understand that payment does not authorize production exploitation.
              </span>
            </label>
            <button className="button button-dark audit-submit" type="submit">
              Continue to secure checkout <span aria-hidden="true">→</span>
            </button>
            <p className="audit-form-footnote">
              Payment is processed by Polar as merchant of record. We never receive your card number.
              See the <Link href="/security-audit/privacy">privacy notice</Link>.
            </p>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
