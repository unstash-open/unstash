import Link from "next/link";
import { PROJECT } from "../../lib/project";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">U</span>
            <span>unstash</span>
          </Link>
          <p className="footer-copy">
            Independent open-source software · Not a charity or investment
          </p>
        </div>
        <div className="footer-links">
          <Link href="/prototype">Prototype</Link>
          <Link href="/extension">Extension 0.1</Link>
          <Link href="/transparency">Funding policy</Link>
          <a href={PROJECT.sourceUrl} target="_blank" rel="noreferrer">
            Source code ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
