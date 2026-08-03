import type { Metadata } from "next";
import Link from "next/link";
import { AuditFooter } from "../components/AuditFooter";
import { AuditHeader } from "../components/AuditHeader";

export const metadata: Metadata = {
  title: "Security audit checkout complete",
  robots: { index: false, follow: false },
};

type SuccessPageProps = {
  searchParams: Promise<{ checkout_id?: string }>;
};

export default async function SecurityAuditSuccessPage({ searchParams }: SuccessPageProps) {
  const { checkout_id: checkoutId } = await searchParams;
  return (
    <>
      <AuditHeader />
      <main className="audit-result-main">
        <section className="audit-result-card shell">
          <span className="audit-result-mark" aria-hidden="true">✓</span>
          <div className="section-kicker">CHECKOUT COMPLETE</div>
          <h1>Next: scope verification.</h1>
          <p>
            If Polar confirmed the payment, the order is now in the fulfillment
            queue. We will verify authorization and request repository access
            through the business email supplied at checkout.
          </p>
          <div className="audit-result-steps">
            <div><span>01</span><strong>Payment confirmation</strong><small>Polar receipt</small></div>
            <div><span>02</span><strong>Authorization check</strong><small>Before any scan</small></div>
            <div><span>03</span><strong>Audit kickoff</strong><small>Immutable commit and deadline</small></div>
          </div>
          {checkoutId ? <p className="audit-reference">Checkout reference: {checkoutId.slice(0, 36)}</p> : null}
          <Link className="button button-dark" href="/security-audit">
            Return to the service page
          </Link>
        </section>
      </main>
      <AuditFooter />
    </>
  );
}
