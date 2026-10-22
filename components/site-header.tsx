"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { softLaunchNavigation } from "@/lib/navigation/soft-launch-navigation";

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
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenCategory(null);
        setMobileExpandedCategory(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

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
            {softLaunchNavigation.map((item) => (
              <li
                className="header-navigation-item"
                key={item.label}
                onMouseEnter={() => setOpenCategory(item.label)}
                onMouseLeave={() => setOpenCategory(null)}
                onFocus={() => setOpenCategory(item.label)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpenCategory(null);
                }}
              >
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  aria-expanded={openCategory === item.label}
                >
                  {item.label}
                </Link>
                <ul className="header-subnavigation" aria-label={`${item.label} topics`} hidden={openCategory !== item.label}>
                  {item.subcategories.map((subcategory) => (
                    <li key={subcategory.label}>
                      <Link href={subcategory.href}>{subcategory.label}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="header-desktop-search"><SearchLink /></div>
          <details className="header-mobile-nav" open={mobileMenuOpen} onToggle={(event) => setMobileMenuOpen(event.currentTarget.open)}>
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              <ul>
                {softLaunchNavigation.map((item) => (
                  <li key={item.label}>
                    <div className="header-mobile-category">
                      <Link href={item.href}>{item.label}</Link>
                      <button
                        type="button"
                        aria-expanded={mobileExpandedCategory === item.label}
                        aria-controls={`mobile-${item.label.toLowerCase()}-topics`}
                        onClick={() => setMobileExpandedCategory((current) => current === item.label ? null : item.label)}
                      >
                        <span className="visually-hidden">Show {item.label} topics</span>
                        <span aria-hidden="true">+</span>
                      </button>
                    </div>
                    <ul id={`mobile-${item.label.toLowerCase()}-topics`} hidden={mobileExpandedCategory !== item.label} className="header-mobile-subnavigation">
                      {item.subcategories.map((subcategory) => (
                        <li key={subcategory.label}><Link href={subcategory.href}>{subcategory.label}</Link></li>
                      ))}
                    </ul>
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
