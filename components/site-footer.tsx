import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="site-shell footer-grid"><div><Link className="footer-name editorial" href="/">THE GABLE EYE</Link><p>Independent research and recommendations.</p></div><div className="footer-links"><Link href="/about/">About The Gable Eye</Link><Link href="/how-we-research/">How We Research</Link><Link href="/how-we-make-money/">How We Make Money</Link><Link href="/editorial-standards/">Editorial Standards</Link><Link href="/corrections/">Corrections & Updates</Link></div><div className="footer-links"><Link href="/contact/">Contact</Link><Link href="/affiliate-disclosure/">Affiliate Disclosure</Link><Link href="/legal-disclaimer/">Legal Disclaimer</Link><Link href="/terms-of-use/">Terms of Use</Link></div></div></footer>;
}
