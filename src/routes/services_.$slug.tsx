import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccentCard, ClosingCta, PageHero, SectionHeading } from "@/components/site";
import { LogoSlider, TestimonialSlider } from "@/components/showcase";
import { SITE_URL, metadata } from "@/lib/site-data";
import { allServices, findService } from "@/lib/services-data";
import { serviceSearchContent } from "@/lib/service-search-content";

export const Route = createFileRoute("/services_/$slug")({
  loader: ({ params }) => {
    const service = findService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Service not found — Macrow Digital" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.service;
    const content = serviceSearchContent[s.id];
    const title = `${content?.title ?? `${s.title} Services`} — Macrow Digital`;
    const description = content?.answer ?? s.desc;
    return {
      ...metadata(title, description, `/services/${params.slug}`),
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: s.title, serviceType: s.services, description: s.desc, url: `${SITE_URL}/services/${s.id}`, areaServed: "Worldwide", category: s.pillar, provider: { "@id": `${SITE_URL}/#organization` } }) },
        { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
          { "@type": "ListItem", position: 3, name: s.title, item: `${SITE_URL}/services/${s.id}` },
        ] }) },
      ],
    };
  },
  notFoundComponent: ServiceNotFound,
  component: ServicePage,
});

function ServiceNotFound() {
  return <section className="mx-auto max-w-3xl px-5 pb-24 pt-40 text-center"><h1 className="text-4xl font-medium">Service not found</h1><Button asChild className="mt-8"><Link to="/services">View all services</Link></Button></section>;
}

function ServicePage() {
  const { service } = Route.useLoaderData();
  const content = serviceSearchContent[service.id];
  const related = allServices.filter((s) => s.pillar === service.pillar && s.id !== service.id).slice(0, 4);
  return <>
    <PageHero eyebrow={`360° ${service.pillar}`} title={<>{content?.title ?? service.title}</>}>
      <p>{content?.answer ?? service.desc}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/contact" search={{ goal: service.title }}>Ask about {service.title} <ArrowRight /></Link></Button>
        <Button asChild variant="outline"><a href="mailto:growth@macrowdigital.com"><Mail /> Email our team</a></Button>
      </div>
    </PageHero>
    <LogoSlider />
    {content && <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-10 md:grid-cols-3"><div><h2 className="text-2xl font-semibold">Who is this for?</h2><p className="mt-4 leading-7 text-muted-foreground">{content.fit}</p></div><div><h2 className="text-2xl font-semibold">What do you receive?</h2><p className="mt-4 leading-7 text-muted-foreground">{content.deliverables} Final scope follows the initial diagnosis.</p></div><div><h2 className="text-2xl font-semibold">How is success measured?</h2><p className="mt-4 leading-7 text-muted-foreground">{content.measure}</p></div></div><p className="mt-10 border-t border-border pt-6 leading-7 text-muted-foreground">Delivered for startups, SMEs and enterprises worldwide, with teams in Jaipur, Ahmedabad and Patna. <Link to="/work" className="font-semibold text-primary underline">Explore our case studies</Link> or <Link to="/blog" className="font-semibold text-primary underline">read our practical insights</Link>.</p></section>}
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <SectionHeading>What’s <span className="editorial">included.</span></SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{service.services.map((x, i) => <AccentCard key={x} accent={(["coral", "green", "gold"] as const)[i % 3]}><Check className="size-5 text-success" /><h3 className="mt-4 text-xl font-semibold">{x}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Planned inside your {service.pillar.toLowerCase()} roadmap and measured against business outcomes.</p></AccentCard>)}</div>
    </section>
    <section className="border-y border-border bg-paper-2 py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
      <div><h2 className="text-3xl font-medium sm:text-4xl">How we deliver <span className="editorial">{service.title}.</span></h2><p className="mt-5 leading-8 text-muted-foreground">One senior team diagnoses, plans, builds and measures — so {service.title.toLowerCase()} connects to the rest of your growth system instead of running in isolation.</p></div>
      <ol className="grid gap-3">{["Diagnose your current position and goal", "Plan scope, sequence and success measures", "Build and launch with senior ownership", "Report, learn and scale what works"].map((x, i) => <li key={x} className="flex gap-4 rounded-2xl border border-border bg-card p-5"><span className="text-primary">0{i + 1}</span>{x}</li>)}</ol>
    </div></section>
    {related.length > 0 && <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <SectionHeading>Related {service.pillar} <span className="editorial">services.</span></SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <Link key={r.id} to="/services/$slug" params={{ slug: r.id }} className="group rounded-2xl border border-border bg-card p-6 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><h3 className="flex items-center justify-between text-lg font-semibold">{r.title}<ArrowRight className="size-4 text-primary transition group-hover:translate-x-1" /></h3><p className="mt-3 text-sm text-muted-foreground">{r.desc}</p></Link>)}</div>
    </section>}
    <TestimonialSlider />
    <ClosingCta />
  </>;
}
