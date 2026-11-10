import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccentCard, Marquee, SectionHeading } from "@/components/site";
import { HomeLeadForm, LogoSlider, TestimonialSlider, WorkSection } from "@/components/showcase";
import { locations, metadata } from "@/lib/site-data";
import heroPoster from "@/assets/hero-agency-poster.webp";
import { HeroVideo } from "@/components/hero-media";
import digitalPhoto from "@/assets/Home/DM 1.png";
import creativePhoto from "@/assets/Home/Marcomm 2.png";
import productPhoto from "@/assets/Home/Technology 3.png";
const pillarImages = [digitalPhoto, creativePhoto, productPhoto];

const faqs = [
  [
    "What does Macrow Digital do?",
    "Macrow Digital is a global growth platform that plans digital marketing, marketing communication (brand, creative, content) and technology (websites, apps, business systems, AI) as one system with one team.",
  ],
  [
    "Do you work with clients outside India?",
    "Yes. We work worldwide with startups, SMEs and enterprises across fourteen sectors, with teams in Jaipur, Ahmedabad and Patna.",
  ],
  [
    "Which services do you offer?",
    "Strategy, performance marketing, SEO and answer-engine optimisation, social and community, lifecycle and analytics, branding, creative, content, video production, UI/UX, web and app development, CRM/ERP, automation, AI solutions and cloud infrastructure.",
  ],
  [
    "How do we get started?",
    "Book a free 30-minute session. Share your goal, we diagnose where you are and recommend the first step — no brief or finished plan needed.",
  ],
  [
    "Do I need to buy every service?",
    "No. Start with the capability that solves your most urgent problem. We sequence the rest only when it adds value.",
  ],
] as const;

const process = [
  ["Diagnose", "A free session to understand your market, audience, offer and current gaps."],
  ["Plan", "One sequenced roadmap across digital, marcomm and technology with clear owners."],
  [
    "Build & launch",
    "Senior teams execute campaigns, creative and platforms against agreed milestones.",
  ],
  ["Measure & scale", "Reporting tied to pipeline and revenue, then we double down on what works."],
] as const;

export const Route = createFileRoute("/")({
  head: () => {
    const m = metadata(
      "Macrow Digital — Digital Marketing, Branding & Technology Agency",
      "Macrow is a global growth platform aligning digital marketing, SEO, branding, creative and technology as one system. Offices in Jaipur, Ahmedabad and Patna.",
      "/",
    );
    return {
      ...m,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        },
      ],
    };
  },
  component: Home,
});

const pillars = [
  [
    "Digital",
    "Demand, channels and distribution — how the market finds you.",
    ["Strategy & Planning", "Performance Marketing", "Search", "Lifecycle & Data"],
  ],
  [
    "Marcomm",
    "Positioning, identity and creative — how the market understands you.",
    ["Brand", "Creative", "Content & Copy", "Production"],
  ],
  [
    "Technology",
    "Product, platforms and automation — how the business actually runs.",
    ["Product & Experience", "Web & Applications", "Business Systems", "AI"],
  ],
] as const;

const heroCapabilities = [
  "Digital Marketing",
  "SEO & AEO",
  "Branding",
  "Creative & Video",
  "Web & Apps",
  "AI & Automation",
] as const;

function Home() {
  return (
    <>
      <section className="relative flex min-h-[min(820px,88svh)] items-center justify-center overflow-hidden bg-background text-hero-foreground">
        <img
          src={heroPoster}
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          alt="Macrow Digital studio where marketing, brand, video, web and AI teams work side by side"
          className="hero-still absolute inset-0 size-full object-cover"
        />
        <HeroVideo poster={heroPoster} />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-background/70 via-background/45 to-background" />
        <div className="hero-enter relative z-10 max-w-6xl px-5 pb-14 pt-28 text-center">
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-hero-foreground/25 bg-background/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-primary" />
            One-stop growth agency
          </p>
          <h1 className="text-6xl font-extrabold leading-none sm:text-8xl lg:text-9xl">
            Macrow Digital
            <span className="mt-5 block text-4xl font-medium sm:text-6xl">
              Everything you need to grow, <span className="editorial">under one roof.</span>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-hero-foreground/80 sm:text-lg">
            Strategy, marketing, brand, creative, technology and AI — planned together and delivered
            by one senior team for startups, SMEs and enterprises worldwide.
          </p>
          <ul
            className="mx-auto mt-7 flex max-w-3xl flex-wrap justify-center gap-2"
            aria-label="What we do"
          >
            {heroCapabilities.map((c, i) => (
              <li
                key={c}
                style={{ animationDelay: `${300 + i * 90}ms` }}
                className="hero-chip rounded-full border border-hero-foreground/20 bg-background/35 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md sm:text-sm"
              >
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contact">
                Tell us what you're working on <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-hero-foreground/70 bg-transparent text-hero-foreground hover:bg-hero-foreground/15"
            >
              <Link to="/services">Explore solutions</Link>
            </Button>
          </div>
        </div>
      </section>
      <LogoSlider />
      <section className="border-b border-border bg-paper-2">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-medium sm:text-3xl">Not sure where to start?</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Tell us what you're trying to solve. You don’t need a brief or a finished plan to get
              a useful first conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">
                Tell us your goal <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:growth@macrowdigital.com">
                <Mail /> Email us
              </a>
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading>
          Three pillars that only <span className="editorial">work together.</span>
        </SectionHeading>
        <p className="mb-10 max-w-2xl text-muted-foreground">
          Bought separately they compete for budget. Planned together they compound — one diagnosis,
          one sequence, one owner.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {pillars.map(([title, hook, bullets], i) => (
            <AccentCard
              key={title}
              className="pillar-card image-reveal overflow-hidden p-0"
              accent={(["coral", "green", "gold"] as const)[i]}
            >
              <img
                src={pillarImages[i]}
                alt={`${title} strategy and execution`}
                width={1408}
                height={960}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-6">
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
                <h2 className="mt-5 text-3xl font-semibold">{title}</h2>
                <p className="mt-4 min-h-20 leading-7 text-muted-foreground">{hook}</p>
                <ul className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
                  {bullets.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </AccentCard>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/services">
            View all capabilities <ArrowRight />
          </Link>
        </Button>
      </section>
      <WorkSection />
      <Marquee
        items={[
          "Understand",
          "Strategize",
          "Build",
          "Communicate",
          "Launch",
          "Measure",
          "Optimize",
          "Scale",
        ]}
      />
      <section className="bg-paper-2 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading>
            Pick the outcome. We’ll <span className="editorial">sequence the work.</span>
          </SectionHeading>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Build a brand",
              "Launch a business",
              "Build a website",
              "Build a product",
              "Generate leads",
              "Increase sales",
            ].map((x, i) => (
              <Link
                key={x}
                to="/contact"
                search={{ goal: x }}
                className="group bg-card p-7 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-6 flex items-center justify-between gap-3 text-2xl font-semibold">
                  {x}
                  <ArrowRight className="size-5 shrink-0 text-primary transition group-hover:translate-x-1" />
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading>
          How an engagement <span className="editorial">works.</span>
        </SectionHeading>
        <ol className="grid gap-4 md:grid-cols-4">
          {process.map(([t, d], i) => (
            <li key={t}>
              <AccentCard
                accent={(["coral", "green", "gold"] as const)[i % 3]}
                className="thinking-card h-full"
              >
                <span className="text-xs text-primary">Step 0{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{t}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{d}</p>
              </AccentCard>
            </li>
          ))}
        </ol>
        <Button asChild className="mt-8">
          <Link to="/contact">
            Book the free diagnosis <ArrowRight />
          </Link>
        </Button>
      </section>
      <section className="border-y border-border bg-paper-2 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading>
            Designed for the world. <span className="editorial">Built in India.</span>
          </SectionHeading>
          <p className="mb-10 max-w-3xl text-lg leading-8 text-muted-foreground">
            Working globally with startups, SMEs and enterprises across fourteen sectors, with
            senior teams in three Indian cities.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {locations.map((l, i) => (
              <AccentCard
                key={l.city}
                className="location-card"
                accent={(["coral", "green", "gold"] as const)[i]}
              >
                <MapPin className="size-5 text-primary" />
                <h3 className="mt-4 text-2xl font-semibold">{l.city}</h3>
                <address className="mt-2 not-italic text-muted-foreground">
                  {l.region} - {l.postal}, India
                </address>
              </AccentCard>
            ))}
          </div>
        </div>
      </section>
      <TestimonialSlider />
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <SectionHeading>
          Questions founders <span className="editorial">ask first.</span>
        </SectionHeading>
        <Accordion type="single" collapsible className="border-t border-border">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`faq-${i}`}>
              <AccordionTrigger className="py-5 text-lg font-semibold hover:text-primary hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent
                data-slot="smooth-faq"
                className="pb-5 text-base leading-7 text-muted-foreground"
              >
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-muted-foreground">
          Still have a question?{" "}
          <a
            href="mailto:growth@macrowdigital.com"
            className="font-semibold text-primary underline underline-offset-4"
          >
            growth@macrowdigital.com
          </a>
        </p>
      </section>
      <HomeLeadForm />
    </>
  );
}
