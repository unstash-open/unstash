import type { Metadata } from "next";
import Link from "next/link";
import { AuditFooter } from "../components/AuditFooter";
import { AuditHeader } from "../components/AuditHeader";

export const metadata: Metadata = {
  title: "Sample security report",
  description: "A sanitized example of the evidence, impact and remediation delivered in a repository security review.",
  alternates: { canonical: "/security-audit/sample-report" },
};

export default function SampleReportPage() {
  return (
    <>
      <AuditHeader />
      <main className="audit-legal-main">
        <article className="audit-legal shell">
          <div className="section-kicker">SANITIZED SAMPLE · MEDIUM SEVERITY</div>
          <h1>Counterfeit token can inflate a public funding total.</h1>
          <p className="audit-legal-lead">
            This example is based on a locally reproduced integrity defect. Identifiers are
            limited to public project data and the issue was validated without contacting production.
          </p>

          <h2>Executive summary</h2>
          <p>
            A transfer aggregator trusted a token&apos;s display symbol as an alternative to
            its canonical contract address. An attacker could deploy a different token with
            the same symbol, transfer an arbitrary quantity to the public wallet and cause
            the campaign UI to report funding that was never received in the official asset.
          </p>

          <h2>Security property</h2>
          <p>Only transfers from the configured official token contract may affect the public total.</p>

          <h2>Evidence chain</h2>
          <ol>
            <li>Attacker controls the counterfeit contract, symbol and transfer quantity.</li>
            <li>The public indexer returns all ERC-20 transfers to the campaign wallet.</li>
            <li>The application accepts a transfer when contract address or symbol matches.</li>
            <li>The raw amount is included in the public total and displayed as the official asset.</li>
          </ol>

          <h2>Impact</h2>
          <p>
            Integrity of the public ledger is lost. Visitors can be misled about campaign
            progress and make decisions using a false total. The issue does not grant access
            to the receiving wallet and does not steal existing funds.
          </p>

          <h2>Remediation</h2>
          <p>
            Require exact, case-normalized equality with the official token contract and
            intended recipient. Treat token symbols only as display metadata. Validate the
            expected decimal precision and campaign window.
          </p>

          <h2>Regression test</h2>
          <p>
            Add a negative fixture whose symbol is identical but whose contract differs;
            assert that it is rejected. Add positive fixtures for the official contracts on
            each supported network and negative fixtures for recipient, decimals and launch time.
          </p>

          <h2>Delivery note</h2>
          <p>
            A client report also records the immutable commit, exact affected lines, scanner
            hypotheses that were rejected, dependency coverage and any assumptions requiring
            maintainer confirmation.
          </p>

          <p className="audit-legal-nav">
            <Link href="/security-audit/intake?plan=beta">Start a fixed-scope review →</Link>
          </p>
        </article>
      </main>
      <AuditFooter />
    </>
  );
}
