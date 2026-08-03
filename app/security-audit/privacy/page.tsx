import type { Metadata } from "next";
import Link from "next/link";
import { AuditFooter } from "../components/AuditFooter";
import { AuditHeader } from "../components/AuditHeader";

export const metadata: Metadata = {
  title: "Repository audit privacy notice",
  robots: { index: false, follow: false },
};

export default function SecurityAuditPrivacyPage() {
  return (
    <>
      <AuditHeader />
      <main className="audit-legal-main">
        <article className="audit-legal shell">
          <div className="section-kicker">PRIVACY NOTICE · 3 AUGUST 2026</div>
          <h1>Security audit privacy.</h1>
          <p className="audit-legal-lead">The audit intake collects only what is needed to qualify, bill and fulfill one security engagement.</p>

          <h2>Data collected</h2>
          <p>The intake collects a business email, optional company name, GitHub repository URL, selected plan and authorization confirmation. Detailed scope, private access and policy documents are requested only after payment verification. Do not submit source code, credentials, user records or production data through checkout.</p>

          <h2>Payments</h2>
          <p>Polar acts as merchant of record and processes checkout, taxes and card data under its own terms. This application receives a checkout identifier, payment status, amount, customer email and limited order metadata; it does not receive the full card number.</p>

          <h2>Fulfillment</h2>
          <p>After Polar verifies payment, the minimum order fields may be sent to the configured private fulfillment system. Polar webhook identifiers are used as idempotency keys so retries do not intentionally create duplicate work.</p>

          <h2>Retention and access</h2>
          <p>Unpaid checkout metadata is not persisted in this application. Paid order and accounting records remain in Polar and the configured fulfillment system for delivery, tax and dispute handling. Audit working copies are scheduled for deletion within 90 days after delivery or 30 days after the final retest, whichever is later, unless a written agreement or legal duty requires longer retention. Private repository access is least-privilege and removed after the engagement unless monitoring was purchased.</p>

          <h2>Public site analytics</h2>
          <p>The public site uses cookie-free route-level analytics. Query strings and URL fragments are removed from analytics events. Repository form fields and Polar checkout metadata are not sent as analytics properties.</p>

          <h2>Data requests</h2>
          <p>Customers can request access, correction or deletion through the engagement email thread. Public GitHub issues must never contain private repository or vulnerability details.</p>

          <p className="audit-legal-nav"><Link href="/security-audit">← Back to security audit</Link></p>
        </article>
      </main>
      <AuditFooter />
    </>
  );
}
