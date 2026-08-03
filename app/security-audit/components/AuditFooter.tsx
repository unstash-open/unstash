import Link from "next/link";
import {
  getSecurityAuditContactHref,
  SECURITY_AUDIT_BUSINESS,
} from "../../../lib/security-audit-business";

export function AuditFooter() {
  const contactHref = getSecurityAuditContactHref();
  const externalContact = contactHref.startsWith("https://");

  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <div>
          <Link className="brand" href="/security-audit">
            <span className="brand-mark" aria-hidden="true">L</span>
            <span>{SECURITY_AUDIT_BUSINESS.name}</span>
          </Link>
          <p className="footer-copy">Independent application-security review for small engineering teams.</p>
          <p className="footer-privacy">Offline-first evidence · explicit authorization · no production exploitation</p>
        </div>
        <div className="footer-links">
          <Link href="/security-audit/methodology">Methodology</Link>
          <Link href="/security-audit/sample-report">Sample report</Link>
          <Link href="/security-audit/terms">Service terms</Link>
          <Link href="/security-audit/privacy">Privacy</Link>
          <a
            href={contactHref}
            target={externalContact ? "_blank" : undefined}
            rel={externalContact ? "noreferrer" : undefined}
          >
            Public pre-sales question{externalContact ? " ↗" : ""}
          </a>
          <Link href="/">Unstash open-source product</Link>
        </div>
      </div>
    </footer>
  );
}
