import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "Repository audit privacy notice",
  robots: { index: false, follow: false },
};

export default function SecurityAuditPrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="audit-legal-main">
        <article className="audit-legal shell">
          <div className="section-kicker">PRIVACY NOTICE · 1 AUGUST 2026</div>
          <h1>Security audit privacy.</h1>
          <p className="audit-legal-lead">The audit intake collects only what is needed to qualify, bill and fulfill one security engagement.</p>

          <h2>Data collected</h2>
          <p>The intake collects a business email, optional company name, GitHub repository URL, optional policy URL, selected plan, authorization confirmation and short scope notes. Do not submit source code, credentials, user records or production data in the form.</p>

          <h2>Payments</h2>
          <p>Stripe processes checkout and card data under its own terms. This application receives a session identifier, payment status, amount, customer email and limited order metadata; it does not receive the full card number.</p>

          <h2>Fulfillment</h2>
          <p>After Stripe verifies payment, the minimum order fields may be sent to the configured private fulfillment system. Stripe event identifiers are used as idempotency keys so retries do not intentionally create duplicate work.</p>

          <h2>Retention and access</h2>
          <p>Intake and audit records should be retained only for delivery, accounting, dispute handling and agreed remediation follow-up, then deleted or anonymized when no longer required. Private repository access must be least-privilege and removed after the engagement unless monitoring was purchased.</p>

          <h2>Public site analytics</h2>
          <p>The public site uses cookie-free route-level analytics. Query strings and URL fragments are removed from analytics events. Repository form fields and Stripe checkout metadata are not sent as analytics properties.</p>

          <p className="audit-legal-nav"><Link href="/security-audit">← Back to security audit</Link></p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
