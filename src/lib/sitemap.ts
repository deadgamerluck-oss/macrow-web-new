import { SITE_URL } from "./site-data";

export type SitemapEntry = { path: string; updatedAt?: string | null };
const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char] ?? char);

export function renderSitemap(entries: SitemapEntry[]): string {
  const unique = new Map(entries.map(entry => [entry.path, entry]));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(unique.values()).map(entry => {
    const date = entry.updatedAt ? new Date(entry.updatedAt) : null;
    const lastmod = date && Number.isFinite(date.getTime()) ? `<lastmod>${date.toISOString()}</lastmod>` : "";
    return `  <url><loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>${lastmod}</url>`;
  }).join("\n")}\n</urlset>`;
}