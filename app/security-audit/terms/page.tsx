import type { Metadata } from "next";
import Link from "next/link";
import { AuditFooter } from "../components/AuditFooter";
import { AuditHeader } from "../components/AuditHeader";

export const metadata: Metadata = {
  title: "Repository audit service terms",
  robots: { index: false, follow: false },
};

export default function SecurityAuditTermsPage() {
  return (
    <>
      <AuditHeader />
      <main className="audit-legal-main">
        <article className="audit-legal shell">
          <div className="section-kicker">SERVICE TERMS · 3 AUGUST 2026</div>
          <h1>Repository audit terms.</h1>
          <p className="audit-legal-lead">These terms apply to the repository security review offered under the LeadHarbor Studio trading name and billed by Polar as merchant of record.</p>

          <h2>Authorization and scope</h2>
          <p>The customer must own the submitted repository or hold written authorization from its owner or an applicable vulnerability disclosure program. Payment is not authorization. Review begins only after repository, commit, allowed techniques and exclusions are recorded.</p>

          <h2>Delivery</h2>
          <p>The service delivers the scope listed for the purchased plan. It does not guarantee a vulnerability count, severity, bounty award, breach prevention or absence of security defects. Timelines begin after authorization, access and required build information are available.</p>

          <h2>Testing boundaries</h2>
          <p>The standard service uses offline source review, static analysis and local proofs with synthetic data. Denial of service, credential use, access to third-party data, persistence, social engineering and production exploitation are excluded unless separately authorized in writing.</p>

          <h2>Refunds</h2>
          <p>If authorization or basic scope cannot be verified before analysis starts, the payment is refunded. After review begins, refunds cover only undelivered scope and are evaluated against work already completed. Subscription cancellation stops future billing and does not reverse a completed monthly review.</p>

          <h2>Confidentiality and customer duties</h2>
          <p>Customers must not submit credentials, production data or personal data through the intake form. Private repository access is requested separately with the least privilege needed. Findings may not be published before coordinated remediation unless both parties agree in writing.</p>

          <h2>Communication</h2>
          <p>Public pre-sales questions may be submitted through the linked GitHub issue template without sensitive details. Engagement-specific communication uses the business email supplied during checkout. Customers must provide a reachable address and an authorized technical contact.</p>

          <h2>Order of documents</h2>
          <p>An engagement-specific scope contract may add repository, commit, exclusions, delivery dates and approved techniques. That signed scope controls those engagement details; these general terms continue to govern all other matters.</p>

          <h2>Liability</h2>
          <p>Security review reduces uncertainty but cannot eliminate risk. Customers remain responsible for deployment, remediation, legal compliance, backups and incident response. Any engagement-specific statement of work supersedes conflicting general language on this page.</p>

          <p className="audit-legal-nav"><Link href="/security-audit">← Back to security audit</Link></p>
        </article>
      </main>
      <AuditFooter />
    </>
  );
}
