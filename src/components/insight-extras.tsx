import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type BlogPost } from "@/lib/cms";
import { publishedPostsQuery } from "@/lib/public-content";
import { SiteImage } from "@/lib/site-images";
import { blogCover } from "@/lib/blog-images";
import { SITE_URL } from "@/lib/site-data";

export function ShareBar({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const u = encodeURIComponent(url), t = encodeURIComponent(post.title);
  const links = [
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["X", `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ] as const;
  return (
    <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-6">
      <span className="mr-2 text-sm font-semibold">Share this insight</span>
      {links.map(([name, href]) => <Button key={name} asChild variant="outline" size="sm"><a href={href} target="_blank" rel="noopener noreferrer">{name}</a></Button>)}
      <Button variant="outline" size="sm" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); }}>{copied ? "Link copied" : "Copy link"}</Button>
    </div>
  );
}

export function RelatedInsights({ post }: { post: BlogPost }) {
  const { data } = useQuery(publishedPostsQuery);
  const others = (data ?? []).filter(p => p.is_published && p.slug !== post.slug);
  const related = [...others.filter(p => p.category === post.category), ...others.filter(p => p.category !== post.category)].slice(0, 3);
  if (!related.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold">Related insights</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {related.map(p => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group block overflow-hidden rounded-xl border border-border bg-card">
            <SiteImage src={p.cover_image} fallback={blogCover} width={1408} height={912} alt="" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="p-4"><p className="text-xs font-semibold text-primary">{p.category}</p><p className="mt-2 font-medium leading-snug group-hover:text-primary">{p.title}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
