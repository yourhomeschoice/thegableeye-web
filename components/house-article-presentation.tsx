import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type HouseGuideItem = Readonly<{ href: string; label: string }>;
export type HouseComparisonColumn = Readonly<{ label: string; width?: string }>;
export type HouseComparisonRow = Readonly<{ subject: string; cells: readonly string[] }>;
export type HouseAlternative = Readonly<{ heading: string; body: ReactNode }>;

export function HouseArticleHeader({ category, title, standfirst }: { category: string; title: string; standfirst: string }) {
  return <header className="house-article-header"><p className="eyebrow">{category}</p><h1 className="editorial">{title}</h1><p className="article-standfirst">{standfirst}</p></header>;
}

export function HouseArticleHero({ src, alt, caption, width = 1600, height = 900 }: { src: string; alt: string; caption?: string; width?: number; height?: number }) {
  return <figure className="house-article-hero"><Image src={src} alt={alt} width={width} height={height} priority sizes="(max-width: 760px) calc(100vw - 32px), 760px" />{caption && <figcaption>{caption}</figcaption>}</figure>;
}

export function HouseGuideAndDisclosure({ items, children }: { items: readonly HouseGuideItem[]; children: ReactNode }) {
  return <>{items.length > 0 && <nav className="house-article-guide-nav" aria-label="In this guide"><p className="eyebrow">In this guide</p><ul>{items.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}</ul></nav>}<p className="house-article-disclosure"><Link href="/affiliate-disclosure/">Affiliate disclosure</Link>: {children}</p></>;
}

export function HouseVerdict({ id, children }: { id: string; children: ReactNode }) {
  return <section id={id} className="house-article-verdict"><p className="eyebrow">THE GABLE’S VERDICT</p>{children}</section>;
}

export function HouseComparisonTable({ id, heading, introduction, columns, rows, stickyFirstColumn = false }: { id: string; heading: string; introduction?: ReactNode; columns: readonly HouseComparisonColumn[]; rows: readonly HouseComparisonRow[]; stickyFirstColumn?: boolean }) {
  return <section id={id} className={`house-article-comparison${stickyFirstColumn ? " house-article-comparison--sticky-first-column" : ""}`}><h2 className="editorial">{heading}</h2>{introduction && <div className="house-article-comparison-introduction">{introduction}</div>}<p className="house-article-swipe-guidance">Swipe to compare →</p><div className="house-article-table-scroll" tabIndex={0} aria-label={heading}><table><thead><tr><th style={columns[0]?.width ? { width: columns[0].width } : undefined}>{columns[0]?.label}</th>{columns.slice(1).map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.subject}><th scope="row">{row.subject}</th>{row.cells.map((cell, index) => <td data-label={columns[index + 1]?.label} key={columns[index + 1]?.label}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

export function HouseAlternativeAssessments({ id, heading, alternatives }: { id: string; heading: string; alternatives: readonly HouseAlternative[] }) {
  return <section id={id}><h2 className="editorial">{heading}</h2><div className="house-article-alternatives">{alternatives.map((alternative) => <section key={alternative.heading}><h3 className="editorial">{alternative.heading}</h3><div className="house-article-alternative-body">{typeof alternative.body === "string" ? <p>{alternative.body}</p> : alternative.body}</div></section>)}</div></section>;
}

export function HouseEditorialIndependence() {
  return <p className="house-article-independence"><strong>Editorial independence:</strong> Our recommendations are based on the comparison described above, not on whether a product has an affiliate partnership. See our <Link href="/affiliate-disclosure/">Affiliate Disclosure</Link> for further information.</p>;
}
