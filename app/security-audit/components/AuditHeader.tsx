import Link from "next/link";

export function AuditHeader() {
  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/security-audit" aria-label="LeadHarbor Security Review home">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>LeadHarbor <small>Security</small></span>
        </Link>
        <nav className="nav-links" aria-label="Security review navigation">
          <Link href="/security-audit/methodology">Methodology</Link>
          <Link href="/security-audit/sample-report">Sample report</Link>
          <Link href="/security-audit#pricing">Pricing</Link>
          <Link className="nav-cta" href="/security-audit/intake?plan=beta">Start review</Link>
        </nav>
      </div>
    </header>
  );
}
