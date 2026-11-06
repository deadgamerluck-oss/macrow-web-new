import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClosingCta, PageHero } from "@/components/site";
import { LogoSlider, TestimonialSlider, WorkCard } from "@/components/showcase";
import { publishedProjectsQuery } from "@/lib/public-content";
import { metadata } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedProjectsQuery),
  head: () => metadata("Our Work — Macrow Digital Projects & Case Studies", "Selected digital marketing, branding and technology projects delivered by Macrow Digital for startups, SMEs and enterprises.", "/work"),
  component: Work,
});

function Work() {
  const { data = [] } = useSuspenseQuery(publishedProjectsQuery);
  const items = data.filter((p) => p.is_published);
  const cats = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? items : items.filter((p) => p.category === cat);
  return <>
    <PageHero compact eyebrow="Our work" title={<>Work that <span className="editorial">compounds.</span></>}><p>A look at how we combine digital, marcomm and technology for the businesses we work with.</p></PageHero>
    <LogoSlider />
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter work">{cats.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent")}>{c}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{shown.map((p, i) => <WorkCard key={p.id} project={p} index={i} />)}</div>
    </section>
    <TestimonialSlider />
    <ClosingCta />
  </>;
}
