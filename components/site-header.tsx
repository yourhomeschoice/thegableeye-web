import Link from "next/link";

const navigation = [{ label: "Travel", href: "/travel/" }, { label: "How We Research", href: "/how-we-research/" }, { label: "About", href: "/about/" }];

function NavigationLinks() { return <ul className="navigation-links">{navigation.map((item) => <li key={item.label}><Link href={item.href}>{item.label}</Link></li>)}</ul>; }

export function SiteHeader() {
  return <header className="site-header"><div className="masthead site-shell"><Link className="masthead-name editorial" href="/">THE GABLE EYE</Link><p className="masthead-descriptor">Independent research and recommendations</p></div><div className="primary-nav-wrap"><nav className="primary-nav site-shell" aria-label="Primary navigation"><NavigationLinks /><details className="mobile-nav"><summary><span>Menu</span><span aria-hidden="true">+</span></summary><NavigationLinks /></details></nav></div></header>;
}
