import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <Link className="footer-name editorial" href="/">
            THE GABLE EYE
          </Link>
          <p>Independent research and recommendations.</p>
        </div>

        <div className="footer-links">
          <Link href="/about/">About Us</Link>
          <Link href="/how-we-research/">How We Research</Link>
          <Link href="/affiliate-disclosure/">Affiliate Disclosure</Link>
        </div>

        <div className="footer-links">
          <Link href="/contact/">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}
