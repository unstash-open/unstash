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
          <p className="footer-privacy">
            Anonymous route-level page counts · no cookies, saved-link telemetry
            or cross-site tracking
          </p>
        </div>
        <div className="footer-links">
          <Link href="/beta">5-minute beta</Link>
          <Link href="/prototype">Prototype</Link>
          <Link href="/extension">Extension 0.1</Link>
          <a href={PROJECT.releaseUrl} target="_blank" rel="noreferrer">
            Release ↗
          </a>
          <Link href="/transparency">Funding policy</Link>
          <a href={PROJECT.sourceUrl} target="_blank" rel="noreferrer">
            Source code ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
