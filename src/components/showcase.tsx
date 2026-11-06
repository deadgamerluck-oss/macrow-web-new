import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccentCard, SectionHeading, fieldClass } from "@/components/site";
import {
  clientLogosQuery,
  testimonialsQuery,
  workProjectsQuery,
  type Testimonial,
  type WorkProject,
} from "@/lib/cms";
import { SiteImage } from "@/lib/site-images";
import { MathCaptcha } from "@/components/captcha";
import { submitContactEnquiry } from "@/lib/public-submissions.functions";
import { cn } from "@/lib/utils";
import { contactSchema } from "@/lib/content-schemas";

const localClientLogoModules = import.meta.glob<string>("../assets/Clients_logo/*.png", {
  eager: true,
  import: "default",
});

const defaultLocalClientLogos: Array<{
  id: string;
  name: string;
  logo_url: string;
  is_published: boolean;
}> = Object.entries(localClientLogoModules)
  .sort(([a], [b]) => {
    const numA = parseInt(a.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
    const numB = parseInt(b.match(/(\d+)\.png$/)?.[1] ?? "0", 10);
    return numA - numB;
  })
  .map(([path, url], index) => {
    const fileName = path.split("/").pop()?.replace(".png", "") ?? `client-${index + 1}`;
    return {
      id: `local-logo-${fileName}`,
      name: `Client ${fileName}`,
      logo_url: url,
      is_published: true,
    };
  });

import digitalPhoto from "@/assets/digital-strategy.webp";
import creativePhoto from "@/assets/creative-studio.webp";
import productPhoto from "@/assets/product-design.webp";
const categoryImages: Record<string, string> = {
  Digital: digitalPhoto,
  Marcomm: creativePhoto,
  Technology: productPhoto,
};

const accents = ["coral", "green", "gold"] as const;

function usePerSlide() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const update = () => setN(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

export function TestimonialSlider({ title }: { title?: React.ReactNode }) {
  const { data = [] } = useQuery(testimonialsQuery);
  const items = data.filter((t) => t.is_published);
  const perSlide = usePerSlide();
  const [slide, setSlide] = useState(0);
  const [open, setOpen] = useState<Testimonial | null>(null);
  const slides = Math.max(1, Math.ceil(items.length / perSlide));
  useEffect(() => {
    if (slide >= slides) setSlide(0);
  }, [slide, slides]);
  if (!items.length) return null;
  const visible = items.slice(slide * perSlide, slide * perSlide + perSlide);
  return (
    <section
      className="border-t border-border bg-paper-2 py-20"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          action={
            slides > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous testimonials"
                  onClick={() => setSlide((slide - 1 + slides) % slides)}
                >
                  <ArrowLeft />
                </Button>
                <span
                  className="min-w-12 text-center text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {slide + 1} / {slides}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next testimonials"
                  onClick={() => setSlide((slide + 1) % slides)}
                >
                  <ArrowRight />
                </Button>
              </div>
            ) : undefined
          }
        >
          {title ?? (
            <>
              What clients <span className="editorial">say.</span>
            </>
          )}
        </SectionHeading>
        <div
          key={slide}
          className={cn(
            "testimonial-enter grid grid-cols-1 gap-4",
            perSlide === 2 && "md:grid-cols-2",
            perSlide === 3 && "lg:grid-cols-3",
          )}
        >
          {visible.map((t, i) => (
            <AccentCard key={t.id} accent={accents[i % 3]} className="flex h-full flex-col">
              <Quote className="size-6 text-primary" aria-hidden="true" />
              <p className="mt-4 line-clamp-4 flex-1 leading-7 text-muted-foreground">{t.quote}</p>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  {t.image_url && (
                    <SiteImage
                      src={t.image_url}
                      alt={t.name}
                      className="size-11 rounded-full border border-border object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(t)}
                  className="shrink-0 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Read full
                </button>
              </div>
            </AccentCard>
          ))}
        </div>
        {slides > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: slides }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slide}
                onClick={() => setSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === slide ? "w-8 bg-primary" : "w-4 bg-border",
                )}
              />
            ))}
          </div>
        )}
      </div>
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
            <DialogDescription>
              {[open?.role, open?.company].filter(Boolean).join(", ")}
            </DialogDescription>
          </DialogHeader>
          <p className="leading-8">{open?.quote}</p>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function LogoSlider({ duration = 120 }: { duration?: number }) {
  const { data = [] } = useQuery(clientLogosQuery);
  const dbLogosWithImages = data.filter((l) => l.is_published && Boolean(l.logo_url));
  const logos = dbLogosWithImages.length > 0 ? dbLogosWithImages : defaultLocalClientLogos;
  if (!logos.length) return null;
  const doubled = [...logos, ...logos];
  return (
    <section aria-label="Clients we work with" className="border-y border-border py-12">
      <p className="mb-8 text-center text-xs font-medium text-muted-foreground">
        Trusted by growing teams across sectors
      </p>
      <div className="overflow-hidden">
        <div
          className="marquee-track trust-track flex w-max items-center"
          style={{ animationDuration: `${duration}s` }}
        >
          {doubled.map((l, i) => (
            <div
              key={`${l.id}-${i}`}
              aria-hidden={i >= logos.length}
              className="trust-logo flex h-16 min-w-48 items-center justify-center px-8"
            >
              {l.logo_url ? (
                l.logo_url.startsWith("http") || l.logo_url.startsWith("storage:") ? (
                  <SiteImage
                    src={l.logo_url}
                    alt={l.name}
                    className="max-h-14 w-auto max-w-[170px] object-contain opacity-85 transition duration-300 hover:opacity-100"
                  />
                ) : (
                  <img
                    src={l.logo_url}
                    alt={l.name}
                    loading="lazy"
                    className="max-h-14 w-auto max-w-[170px] object-contain opacity-85 transition duration-300 hover:opacity-100"
                  />
                )
              ) : (
                <span className="font-display text-xl font-semibold">{l.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkCard({ project, index }: { project: WorkProject; index: number }) {
  return (
    <AccentCard
      accent={accents[index % 3]}
      className="flex h-full flex-col p-0 overflow-hidden image-reveal"
    >
      {project.image_url ? (
        <SiteImage
          src={project.image_url}
          alt={project.title}
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <img
          src={categoryImages[project.category] ?? digitalPhoto}
          alt={`${project.category} creative work illustration`}
          width={1408}
          height={960}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-primary">
          {project.category} · {project.client}
        </p>
        <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
        <p className="mt-3 flex-1 leading-7 text-muted-foreground">{project.summary}</p>
        {project.result && (
          <p className="mt-5 border-t border-border pt-4 text-sm font-semibold text-success">
            {project.result}
          </p>
        )}
        {project.slug && (
          <Button asChild variant="outline" size="sm" className="mt-5 self-start">
            <Link to="/work/$slug" params={{ slug: project.slug }}>
              Read full case study <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </AccentCard>
  );
}

export function WorkSection({ limit = 3 }: { limit?: number }) {
  const { data = [] } = useQuery(workProjectsQuery);
  const items = data.filter((p) => p.is_published).slice(0, limit);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <SectionHeading
        action={
          <Button asChild variant="outline">
            <Link to="/work">
              See all work <ArrowRight />
            </Link>
          </Button>
        }
      >
        Selected <span className="editorial">work.</span>
      </SectionHeading>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((p, i) => (
          <WorkCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

export function HomeLeadForm() {
  const submitContact = useServerFn(submitContactEnquiry);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [human, setHuman] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    if (!human) return setState("error");
    const f = new FormData(form);
    const name = String(f.get("name")),
      email = String(f.get("email"));
    if (
      !contactSchema.safeParse({
        name,
        email,
        phone: String(f.get("phone") ?? ""),
        budget: "",
        message: String(f.get("message") ?? ""),
      }).success
    ) {
      setState("error");
      return;
    }
    setState("busy");
    try {
      await submitContact({
        data: {
          name,
          email,
          phone: String(f.get("phone") ?? ""),
          message: String(f.get("message") ?? ""),
          source: "Home page form",
          website: "",
        },
      });
      setState("done");
    } catch {
      setState("error");
    }
  }
  return (
    <section className="page-glow border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="mb-5 text-xs text-primary">FREE 30-MINUTE SESSION</p>
          <h2 className="text-4xl font-medium sm:text-6xl">
            Let’s build what’s <span className="editorial">next</span>.
          </h2>
          <p className="mt-5 max-w-lg leading-8 text-muted-foreground">
            Tell us where you are. We’ll tell you what we’d do first — no brief, no obligation.
            Prefer email? Write to{" "}
            <a
              className="font-semibold text-primary underline underline-offset-4"
              href="mailto:growth@macrowdigital.com"
            >
              growth@macrowdigital.com
            </a>
            .
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <li>· Reply within one business day</li>
            <li>· Senior strategist on the first call</li>
            <li>· Clear next step, even if it isn’t us</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          {state === "done" ? (
            <div role="status" className="rounded-2xl border border-success/30 bg-success/10 p-7">
              <h3 className="text-2xl font-bold text-success">Message received.</h3>
              <p className="mt-3">
                Thanks — our team will get back to you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="hl-name" className="text-sm font-semibold">
                    Full name
                  </label>
                  <input id="hl-name" name="name" required maxLength={100} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="hl-email" className="text-sm font-semibold">
                    Work email
                  </label>
                  <input
                    id="hl-email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="hl-phone" className="text-sm font-semibold">
                  Phone
                </label>
                <input
                  id="hl-phone"
                  name="phone"
                  type="tel"
                  required
                  minLength={7}
                  maxLength={20}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="hl-message" className="text-sm font-semibold">
                  What are you working on?
                </label>
                <textarea
                  id="hl-message"
                  name="message"
                  required
                  maxLength={1500}
                  className={`${fieldClass} fixed-message py-3`}
                  placeholder="A few lines are enough."
                />
              </div>
              <MathCaptcha id="hl-captcha" onValid={setHuman} />
              {state === "error" && (
                <p role="alert" className="text-sm text-primary">
                  Something went wrong. Please check the quick-check answer and try again, or email
                  growth@macrowdigital.com.
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="justify-self-start"
                disabled={state === "busy"}
              >
                {state === "busy" ? "Sending…" : "Start a conversation"} <ArrowRight />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
