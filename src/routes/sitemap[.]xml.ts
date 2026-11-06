import { createFileRoute } from "@tanstack/react-router";
import { allServices } from "@/lib/services-data";
import { renderSitemap, type SitemapEntry } from "@/lib/sitemap";
import { publicContentClient } from "@/lib/public-content.functions";

const pages = [["/", "1.0", "weekly"], ["/services", "0.9", "monthly"], ["/about", "0.7", "monthly"], ["/blog", "0.8", "weekly"], ["/career", "0.6", "weekly"], ["/contact", "0.8", "monthly"], ["/work", "0.8", "weekly"], ["/partner", "0.5", "monthly"], ["/privacy", "0.3", "monthly"], ["/cookies", "0.3", "monthly"], ...allServices.map((s) => [`/services/${s.id}`, "0.8", "monthly"] as const)] as const;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const client = publicContentClient();
          const entries: SitemapEntry[] = pages.map(([path]) => ({ path }));
          for (const table of ["blog_posts", "work_projects"] as const) {
            for (let offset = 0; ; offset += 500) {
              const query = table === "blog_posts"
                ? client.from(table).select("slug, updated_at").eq("is_published", true).order("id").range(offset, offset + 499)
                : client.from(table).select("slug").eq("is_published", true).order("id").range(offset, offset + 499);
              const { data, error } = await query;
              if (error) throw new Error("Sitemap content is unavailable.");
              for (const row of data ?? []) {
                if (!row.slug) continue;
                entries.push({ path: `/${table === "blog_posts" ? "blog" : "work"}/${row.slug}`, ...( "updated_at" in row && typeof row.updated_at === "string" ? { updatedAt: row.updated_at } : {}) });
              }
              if (!data || data.length < 500) break;
            }
          }
          return new Response(renderSitemap(entries), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" } });
        } catch {
          return new Response("Sitemap temporarily unavailable.", { status: 503, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
        }
      },
    },
  },
});
