import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getPublishedProject } from "@/lib/public-content.functions";
import { articleHead } from "@/lib/search-metadata";
import { metadata } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { SiteImage } from "@/lib/site-images";
import { ClosingCta } from "@/components/site";
import { RichText } from "@/lib/rich-text";

const workProjectQuery = (slug: string) => queryOptions({
  queryKey: ["work_project", slug],
  queryFn: () => getPublishedProject({ data: { slug } }),
});

export const Route = createFileRoute("/work_/$slug")({
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(workProjectQuery(params.slug));
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => loaderData
    ? articleHead(loaderData, "work")
    : metadata("Case study unavailable — Macrow Digital", "This case study is unavailable."),
  notFoundComponent: () => <main className="mx-auto max-w-3xl px-5 py-40"><h1 className="text-4xl">Case study not found.</h1><Button asChild variant="outline" className="mt-6"><Link to="/work">All work</Link></Button></main>,
  component: CaseStudy,
});

function CaseStudy() {
  const { slug } = Route.useParams();
  const { data: project } = useSuspenseQuery(workProjectQuery(slug));
  if (!project) return null;
  const blocks = (project.body ?? "").split(/\n\s*\n/).filter(Boolean);
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-36 lg:px-8">
      
      <Button asChild variant="ghost" className="mb-8"><Link to="/work"><ArrowLeft /> All work</Link></Button>
      <p className="text-sm font-semibold text-primary">{project.category} · {project.client}</p>
      <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">{project.title}</h1>
      <p className="mt-6 text-xl leading-8 text-muted-foreground">{project.summary}</p>
      {project.image_url && <SiteImage loading="eager" fetchPriority="high" width={1408} height={880} src={project.image_url} alt={project.title} className="mt-10 aspect-[16/10] w-full rounded-2xl object-cover" />}
      {project.result && <p className="mt-8 rounded-2xl border border-success/30 bg-success/10 p-6 font-semibold text-success">{project.result}</p>}
      {blocks.length > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <RichText text={project.body} />
        </div>
      )}
      <div className="mt-16"><ClosingCta /></div>
    </main>
  );
}
