import { createFileRoute, Link } from "@tanstack/react-router";
import { Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccentCard, ClosingCta, PageHero, SectionHeading } from "@/components/site";
import { metadata } from "@/lib/site-data";
import { LogoSlider, TestimonialSlider } from "@/components/showcase";
import teamPhoto from "@/assets/Home/About us 1.png";

import lakshmanPhoto from "@/assets/team/lakshman.jpg";
import atulPhoto from "@/assets/team/atul.jpg";
import honeyPhoto from "@/assets/team/Honey.jpg";
import hiteshPhoto from "@/assets/team/hitesh.jpg";
import sumitPhoto from "@/assets/team/sumit.jpg";
import shilpaPhoto from "@/assets/team/shilpa.jpg";
import gajendraPhoto from "@/assets/team/gajendra.jpg";
import sangeetaPhoto from "@/assets/team/sangeeta.jpg";
import chitranshiPhoto from "@/assets/team/chitranshi.jpg";
import rajPhoto from "@/assets/team/raj.jpg";
import prakashPhoto from "@/assets/team/prakash.jpg";
import vandanaPhoto from "@/assets/team/vandana.jpg";
export const Route = createFileRoute("/about")({
  head: () =>
    metadata(
      "About Macrow Digital — Marketing, Marcomm & Technology Team",
      "Meet Macrow Digital: an integrated digital marketing, branding and technology team serving clients worldwide from Jaipur, Ahmedabad and Patna.",
      "/about",
    ),
  component: About,
});

const team: ReadonlyArray<{
  name: string;
  role: string;
  email: string;
  linkedin: string;
  image?: string;
}> = [
  {
    name: "Lakshman Sharma",
    role: "Co Founder",
    email: "lakshman@macrowdigital.com",
    linkedin: "https://www.linkedin.com/in/lakshman-sharma/",
    image: lakshmanPhoto,
  },
  {
    name: "Atul Sinha",
    role: "Co Founder",
    email: "atul@macrowdigital.com",
    linkedin: "https://www.linkedin.com/in/atulsinhaa/",
    image: atulPhoto,
  },
  {
    name: "Honey Sinha",
    role: "Director, Lead Strategist",
    email: "honey@macrowdigital.com",
    linkedin: "https://www.linkedin.com/in/the-honey-sinha/",
    image: honeyPhoto,
  },
  {
    name: "Hitesh Goraiya",
    role: "Sales Head (Canada)",
    email: "",
    linkedin: "",
    image: hiteshPhoto,
  },
  {
    name: "Sumit Gohil",
    role: "Sr. Graphic Designer",
    email: "",
    linkedin: "",
    image: sumitPhoto,
  },
  {
    name: "Shilpa Singhvi",
    role: "Sr. Content Writer",
    email: "",
    linkedin: "",
    image: shilpaPhoto,
  },
  {
    name: "Gajendra Singh",
    role: "Sales & Client Relations Lead",
    email: "",
    linkedin: "",
    image: gajendraPhoto,
  },
  {
    name: "Sangeeta Nagar",
    role: "Business Development Executive",
    email: "",
    linkedin: "",
    image: sangeetaPhoto,
  },
  {
    name: "Chitranshi Chouhan",
    role: "Content & Creative Associate",
    email: "",
    linkedin: "",
    image: chitranshiPhoto,
  },
  {
    name: "Vandana Solanki",
    role: "Content Creator",
    email: "",
    linkedin: "",
    image: vandanaPhoto,
  },
  // {
  //   name: "Raj Chouhan",
  //   role: "Frontend Developer",
  //   email: "",
  //   linkedin: "",
  //   image: rajPhoto,
  // },

  {
    name: "Prakash Arora",
    role: "Intern",
    email: "",
    linkedin: "",
    image: prakashPhoto,
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Macrow"
        title={
          <>
            Macrow Digital.
            <br />
            <span className="editorial">One integrated team.</span>
          </>
        }
      >
        <p>
          Growth is no longer just a marketing challenge. It is about aligning strategy,
          communication and technology to move in one direction — with one team driving the outcome.
        </p>
      </PageHero>
      <LogoSlider />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:px-8">
        <img
          src={teamPhoto}
          loading="lazy"
          width={1024}
          height={1280}
          alt="Senior strategists collaborating around a table"
          className="h-full max-h-[620px] w-full rounded-2xl object-cover"
        />
        <div>
          <h2 className="text-4xl font-medium">
            A growth platform, <span className="editorial">not an agency roster.</span>
          </h2>
          <p className="mt-7 leading-8 text-muted-foreground">
            We work with startups finding their first market, SMEs professionalising growth and
            enterprises modernising at scale. One strategic view replaces three vendors, three
            dashboards and three definitions of success.
          </p>
          <p className="mt-5 leading-8 text-muted-foreground">
            The strategists who diagnose the problem are the same people who own execution and
            report on the outcome. Smaller teams, faster iteration and complete alignment.
          </p>
          <blockquote className="mt-8 border-l-2 border-primary pl-5 text-xl">
            “Strategy without execution is just hallucination, and execution without strategy is
            just noise.”
          </blockquote>
        </div>
      </section>
      <section className="bg-paper-2">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeading>
            How we <span className="editorial">think.</span>
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Observe before acting",
                "We read the market, data and internal reality before recommending spend.",
              ],
              [
                "Strategy owns the sequence",
                "Every channel, campaign and system exists inside a plan with an order.",
              ],
              [
                "One team, three disciplines",
                "Digital, marcomm and technology sit in the same room.",
              ],
              [
                "Compound, don’t restart",
                "We build assets that keep working instead of campaigns that reset each quarter.",
              ],
            ].map(([t, d], i) => (
              <AccentCard
                key={t}
                className="thinking-card"
                accent={(["coral", "green", "gold", "coral"] as const)[i]}
              >
                <h3 className="text-xl font-semibold">{t}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">{d}</p>
              </AccentCard>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          action={
            <Button asChild>
              <Link to="/contact">Start a conversation</Link>
            </Button>
          }
        >
          Senior people, <span className="editorial">no handoff layers.</span>
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map(({ name, role, email, linkedin, image }) => (
            <article
              key={name}
              className="image-reveal border border-border bg-card overflow-hidden flex flex-col"
            >
              {image ? (
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`${name} initials`}
                  className="flex aspect-[4/5] items-center justify-center bg-paper-2 font-display text-5xl text-primary/70"
                >
                  {name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
              )}
              <div className="p-5 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">{role}</p>
                </div>
                <div className="mt-4 flex gap-4 text-primary">
                  {email && (
                    <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
                      <Mail className="size-5" />
                    </a>
                  )}
                  {linkedin && (
                    <a href={linkedin} rel="noreferrer" aria-label={`${name} on LinkedIn`}>
                      <Linkedin className="size-5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
          <article className="image-reveal flex flex-col border border-dashed border-primary/50 bg-card">
            <div className="flex aspect-[4/5] items-center justify-center bg-primary/10 font-display text-5xl text-primary">
              You?
            </div>
            <div className="flex flex-1 flex-col p-5 justify-between">
              <div>
                <h3 className="text-xl font-semibold">Join our team</h3>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                  We are always looking for curious minds in strategy, design, content and code.
                </p>
              </div>
              <Button asChild className="mt-4 self-start">
                <Link to="/career">See open roles</Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
      <TestimonialSlider />
      <ClosingCta />
    </>
  );
}
