import { parseFragment, type DefaultTreeAdapterTypes, type ParserError } from "parse5";

const ALLOWED_TAGS = new Set(["a", "b", "br", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6", "i", "li", "ol", "p", "strong", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"]);
const VOID_TAGS = new Set(["br"]);
const BLOCK_TAGS = new Set(["div", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "p", "table", "ul"]);
const TABLE_SECTION_TAGS = new Set(["thead", "tbody", "tfoot"]);

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

function safeHref(value: string): string {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  let url: URL;
  try { url = new URL(href); } catch { throw new Error("Editorial HTML link must use an absolute HTTPS URL or a site-relative path."); }
  if (url.protocol !== "https:") throw new Error("Editorial HTML links must use HTTPS.");
  return href;
}

function sanitiseAttributes(node: DefaultTreeAdapterTypes.Element): string {
  const allowed = node.tagName === "a" ? new Set(["href"]) : node.tagName === "div" ? new Set(["class"]) : node.tagName === "th" ? new Set(["scope"]) : new Set<string>();
  const seen = new Set<string>();
  const attributes: string[] = [];
  for (const attribute of node.attrs) {
    const name = attribute.name.toLowerCase();
    if (!allowed.has(name) || seen.has(name)) throw new Error("Editorial HTML contains an unsupported attribute: " + name + ".");
    seen.add(name);
    if (name === "href") attributes.push(' href="' + escapeAttribute(safeHref(attribute.value)) + '"');
    if (name === "class") {
      if (attribute.value !== "article-table-scroll") throw new Error("Editorial HTML only permits the article-table-scroll div class.");
      attributes.push(' class="article-table-scroll"');
    }
    if (name === "scope") {
      if (attribute.value !== "row" && attribute.value !== "col") throw new Error("Editorial HTML table header scope must be row or col.");
      attributes.push(' scope="' + attribute.value + '"');
    }
  }
  return attributes.join("");
}

function permitsChild(parent: string | undefined, child: string): boolean {
  if (!parent) return child !== "thead" && child !== "tbody" && child !== "tfoot" && child !== "tr" && child !== "th" && child !== "td" && child !== "li";
  if (parent === "p" || /^h[1-6]$/.test(parent)) return !BLOCK_TAGS.has(child) && child !== "li";
  if (parent === "ul" || parent === "ol") return child === "li";
  if (parent === "table") return TABLE_SECTION_TAGS.has(child);
  if (TABLE_SECTION_TAGS.has(parent)) return child === "tr";
  if (parent === "tr") return child === "th" || child === "td";
  return true;
}

function renderNode(node: DefaultTreeAdapterTypes.ChildNode, parent?: string): string {
  if (node.nodeName === "#text") return escapeText((node as DefaultTreeAdapterTypes.TextNode).value);
  if (node.nodeName === "#comment" || node.nodeName === "#documentType") throw new Error("Editorial HTML comments and declarations are not permitted.");
  const element = node as DefaultTreeAdapterTypes.Element;
  const name = element.tagName;
  if (!ALLOWED_TAGS.has(name) || !permitsChild(parent, name)) throw new Error("Editorial HTML contains unsupported element placement: " + name + ".");
  const location = element.sourceCodeLocation;
  const implicitTableBody = parent === "table" && name === "tbody" && !location?.startTag && element.attrs.length === 0;
  if ((!implicitTableBody && !location?.startTag) || (!VOID_TAGS.has(name) && !implicitTableBody && !location?.endTag)) throw new Error("Editorial HTML contains malformed or browser-repaired markup.");
  const attributes = sanitiseAttributes(element);
  if (VOID_TAGS.has(name)) return "<br>";
  return "<" + name + attributes + ">" + element.childNodes.map((child) => renderNode(child, name)).join("") + "</" + name + ">";
}

/** Parses browser-equivalent HTML, then validates the small trusted editorial contract. */
export function sanitiseTrustedEditorialHtml(html: string): string {
  if (!html.trim()) throw new Error("Editorial HTML must be non-empty.");
  const parseErrors: ParserError[] = [];
  const fragment = parseFragment(html, { sourceCodeLocationInfo: true, onParseError: (error) => parseErrors.push(error) });
  if (parseErrors.length > 0) throw new Error("Editorial HTML contains malformed markup.");
  return fragment.childNodes.map((node) => renderNode(node)).join("");
}
