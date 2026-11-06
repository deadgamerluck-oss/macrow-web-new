import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getPublishedPost } from "@/lib/content.functions";
import { metadata } from "@/lib/site-data";
import { articleHead } from "@/lib/search-metadata";
import { Button } from "@/components/ui/button";
import { blogCover } from "@/lib/blog-images";
import { SiteImage } from "@/lib/site-images";
import { RelatedInsights, ShareBar } from "@/components/insight-extras";
import { RichText } from "@/lib/rich-text";

const postQuery = (slug: string) => queryOptions({ queryKey: ["published_post", slug], queryFn: () => getPublishedPost({ data: { slug } }) });
export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => loaderData ? articleHead(loaderData, "blog") : metadata("Insight unavailable — Macrow Digital", "This insight is unavailable."),
  notFoundComponent: () => <main className="mx-auto max-w-3xl px-5 py-40"><h1 className="text-4xl">Insight not found.</h1><Button asChild variant="outline" className="mt-6"><Link to="/blog">All insights</Link></Button></main>,
  component: Insight,
});
function Insight() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  if (!post) return null;
  return <main className="mx-auto max-w-3xl px-5 pb-24 pt-36 lg:px-8"><Button asChild variant="ghost" className="mb-8"><Link to="/blog"><ArrowLeft /> All insights</Link></Button><p className="text-sm font-semibold text-primary">{post.category} {post.read_time ? `· ${post.read_time}` : ""}</p><h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">{post.title}</h1><p className="mt-6 text-xl leading-8 text-muted-foreground">{post.summary}</p><p className="mt-5 text-sm text-muted-foreground">By Macrow Digital Editorial Team · <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></p><SiteImage loading="eager" fetchPriority="high" src={post.cover_image} fallback={blogCover} width={1408} height={912} alt={post.title} className="mt-10 aspect-[16/10] w-full rounded-2xl object-cover" /><div className="mt-10 border-t border-border pt-8"><RichText text={post.body} /></div><p className="mt-12 text-sm text-muted-foreground">Examples reference publicly reported information about the companies named; Macrow Digital is not affiliated with them.</p><ShareBar post={post} /><RelatedInsights post={post} /></main>;
}