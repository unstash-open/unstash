import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="Unstash home">
          <span className="brand-mark" aria-hidden="true">U</span>
          <span>unstash</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/#demo">Demo</Link>
          <Link href="/extension">Extension</Link>
          <Link href="/#test">Test it</Link>
          <Link href="/transparency">Transparency</Link>
          <Link className="nav-cta" href="/prototype">Try Unstash</Link>
        </nav>
      </div>
    </header>
  );
}
