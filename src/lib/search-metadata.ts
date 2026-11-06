import { SITE_URL, metadata } from "./site-data";

export function breadcrumbSchema(section: string, sectionPath: string, title: string, path: string) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: section, item: `${SITE_URL}${sectionPath}` },
    { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${path}` },
  ] };
}

export function articleHead(post: { title: string; summary: string; slug: string | null; category: string; published_at?: string; updated_at?: string }, section: "blog" | "work") {
  const path = `/${section}/${post.slug}`;
  const label = section === "blog" ? "Insights" : "Case studies";
  return {
    ...metadata(`${post.title} — Macrow Digital`, post.summary, path, "article"),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": section === "blog" ? "BlogPosting" : "Article",
        headline: post.title, description: post.summary, articleSection: post.category,
        mainEntityOfPage: `${SITE_URL}${path}`, inLanguage: "en",
        ...(post.published_at ? { datePublished: post.published_at } : {}),
        ...(post.updated_at ? { dateModified: post.updated_at } : {}),
        author: { "@type": "Organization", name: section === "blog" ? "Macrow Digital Editorial Team" : "Macrow Digital", url: `${SITE_URL}/about` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }).replace(/</g, "\\u003c") },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(label, `/${section}`, post.title, path)) },
    ],
  };
}