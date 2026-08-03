import type { Metadata } from "next";
import Link from "next/link";
import { AuditFooter } from "../components/AuditFooter";
import { AuditHeader } from "../components/AuditHeader";

export const metadata: Metadata = {
  title: "Review methodology",
  description: "The evidence standard, coverage matrix and safety boundaries used in a LeadHarbor repository review.",
  alternates: { canonical: "/security-audit/methodology" },
};

const coverage = [
  ["Repository inventory", "Manifests, source, generated boundaries, binaries, CI, release and deployment files."],
  ["Dependencies", "Production and build dependency advisories, provenance and reachable usage."],
  ["Application security", "Trust boundaries, parsers, authorization, redirects, rendering, secrets and external calls."],
  ["Delivery pipeline", "Workflow permissions, untrusted inputs, release integrity and deployment configuration."],
  ["Human validation", "Attacker control, reachability, missing control, local reproduction and concrete impact."],
  ["Remediation", "Fix direction, regression-test guidance and one verification pass on the Standard plan."],
];

export default function MethodologyPage() {
  return (
    <>
      <AuditHeader />
      <main className="audit-legal-main">
        <article className="audit-legal shell">
          <div className="section-kicker">METHODOLOGY · EVIDENCE BEFORE SEVERITY</div>
          <h1>Every finding must survive human review.</h1>
          <p className="audit-legal-lead">
            Automated matches remain leads until we can show attacker-controlled input,
            a reachable path, a missing control and concrete impact.
          </p>

          <h2>Coverage matrix</h2>
          <div className="audit-steps">
            {coverage.map(([title, detail], index) => (
              <section key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </section>
            ))}
          </div>

          <h2>Safety boundary</h2>
          <p>
            The default engagement is an offline source review at one immutable commit.
            We do not perform denial of service, credential attacks, persistence, social
            engineering, third-party data access or production exploitation. Any broader
            testing requires separate written authorization.
          </p>

          <h2>Severity and reporting</h2>
          <p>
            Results are separated into Confirmed, Needs maintainer context, Hardening and
            Rejected. A confirmed finding includes evidence, prerequisites, impact,
            remediation direction and a regression-test recommendation. Scanner volume is
            never presented as vulnerability count.
          </p>

          <p className="audit-legal-nav">
            <Link href="/security-audit/sample-report">Read the sample report →</Link>
          </p>
        </article>
      </main>
      <AuditFooter />
    </>
  );
}
