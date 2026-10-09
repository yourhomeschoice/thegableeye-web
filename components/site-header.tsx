import Link from "next/link";

const navigation = [
  { label: "Travel", href: "/travel/" },
  { label: "Tech", href: "/tech/" },
  { label: "Home", href: "/home/" },
  { label: "Lifestyle", href: "/lifestyle/" },
];

function SearchLink({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link
      href="/search/"
      className="header-search-link"
      aria-label="Search The Gable Eye"
      title="Search"
    >
      <svg
        aria-hidden="true"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg>
      {mobile ? <span>Search</span> : <span className="visually-hidden">Search</span>}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link
          href="/"
          className="header-brand"
          aria-label="The Gable Eye homepage"
        >
          <span className="header-logo-placeholder" aria-hidden="true" />
          <span className="header-brand-copy">
            <span className="header-brand-name editorial">The Gable Eye</span>
            <span className="header-brand-tagline">
              Independent research and recommendations
            </span>
          </span>
        </Link>

        <nav className="header-navigation" aria-label="Primary navigation">
          <ul className="header-navigation-links">
            {navigation.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="header-desktop-search"><SearchLink /></div>
          <details className="header-mobile-nav">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              <ul>
                {navigation.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
                <li><SearchLink mobile /></li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
