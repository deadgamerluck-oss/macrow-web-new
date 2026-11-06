import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AccentCard, ClosingCta, PageHero, SectionHeading, fieldClass } from "@/components/site";
import { metadata } from "@/lib/site-data";
import { publishedPostsQuery } from "@/lib/public-content";
import { blogCover } from "@/lib/blog-images";
import { SiteImage } from "@/lib/site-images";
import { subscribeNewsletter } from "@/lib/content.functions";
import { newsletterSchema } from "@/lib/content-schemas";

export const Route = createFileRoute("/blog")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedPostsQuery),
  head: () => metadata("Digital Marketing, AI & Marcomm Insights — Macrow Digital", "Explore practical guides and public case examples covering SEO, AI automation, performance marketing, branding and web technology.", "/blog"),
  component: Blog,
});

function Blog() {
  const [filter, setFilter] = useState("All");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subscribe = useServerFn(subscribeNewsletter);
  async function submitNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const fields = new FormData(e.currentTarget);
    const parsed = newsletterSchema.safeParse({ email: fields.get("email"), consent: fields.get("consent") === "on" });
    if (!parsed.success) { setError("Enter a valid email and agree to receive growth notes."); return; }
    setBusy(true); setError("");
    try { await subscribe({ data: parsed.data }); setDone(true); } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); } finally { setBusy(false); }
  }
  const { data } = useSuspenseQuery(publishedPostsQuery);

  const published = useMemo(() => (data ?? []).filter((post) => post.is_published), [data]);
  const featured = published.find((post) => post.is_featured);
  const rest = published.filter((post) => !post.is_featured);
  const filters = useMemo(() => ["All", ...Array.from(new Set(rest.map((post) => post.category)))], [rest]);
  const visible = rest.filter((post) => filter === "All" || post.category === filter);

  return (
    <>
      <PageHero eyebrow="Learning hub" title={<>Marketing, Marcomm &<br /><span className="editorial">Technology Insights.</span></>}>
        <p>Practical guides and public case examples on SEO, AI automation, performance marketing, branding and digital products for founders and growing teams.</p>
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 pb-20 lg:px-8">
        {featured && (
          <article className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1.1fr_1fr]">
            <SiteImage src={featured.cover_image} fallback={blogCover} width={1408} height={912} alt={featured.title} className="h-full min-h-72 w-full object-cover" />
            <div className="p-7 md:p-10">
              <p className="text-xs font-semibold text-primary">{featured.category.toUpperCase()}</p>
              <h2 className="mt-4 text-3xl font-medium"><Link to="/blog/$slug" params={{ slug: featured.slug }} className="transition-colors hover:text-primary">{featured.title}</Link></h2>
              <p className="mt-5 leading-7 text-muted-foreground">{featured.summary}</p>
              {featured.read_time && <p className="mt-7 text-xs text-muted-foreground">{featured.read_time}</p>}
            </div>
          </article>
        )}

        <div className="my-10 flex flex-wrap gap-2" role="group" aria-label="Filter blog posts">
          {filters.map((x) => (
            <Button key={x} variant={filter === x ? "default" : "outline"} size="sm" onClick={() => setFilter(x)} aria-pressed={filter === x}>{x}</Button>
          ))}
        </div>

        {(
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((post, i) => (
              <AccentCard key={post.id} accent={(["coral", "green", "gold"] as const)[i % 3]}>
                <SiteImage src={post.cover_image} fallback={blogCover} width={1408} height={912} alt="" className="-mx-1 mb-5 aspect-[16/10] w-[calc(100%+0.5rem)] rounded-lg object-cover" />
                <p className="text-sm font-semibold text-primary">{post.category}</p>
                <h3 className="mt-4 text-2xl font-semibold"><Link to="/blog/$slug" params={{ slug: post.slug }} className="transition-colors hover:text-primary">{post.title}</Link></h3>
                <p className="mt-4 text-muted-foreground">{post.summary}</p>
                {post.read_time && <p className="mt-7 border-t border-border pt-4 text-sm">{post.read_time}</p>}
              </AccentCard>
            ))}
          </div>
        )}
      </section>

      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeading>Get growth tips in your inbox.</SectionHeading>
          {done ? (
            <p role="status" className="max-w-2xl border border-success/30 bg-success/10 p-5 font-medium text-success">Your subscription has been saved. Thank you for joining.</p>
          ) : (
            <form className="flex max-w-2xl flex-wrap gap-3" onSubmit={submitNewsletter}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" name="email" className={`${fieldClass} flex-1 basis-64`} type="email" maxLength={255} required placeholder="you@company.com" />
              <Button type="submit" size="lg" className="mt-2" disabled={busy}>{busy ? "Saving…" : "Subscribe"}</Button>
              <label className="flex w-full items-start gap-2 text-sm text-muted-foreground"><input name="consent" type="checkbox" required className="mt-1 shrink-0" /><span>I agree to receive Macrow growth notes and have read the <Link to="/privacy" className="underline">privacy policy</Link>.</span></label>
              {error && <p role="alert" className="w-full text-sm text-primary">{error}</p>}
            </form>
          )}
        </div>
      </section>
      <ClosingCta />
    </>
  );
}
