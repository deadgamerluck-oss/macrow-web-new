import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  ArrowUpRight,
  Moon,
  Sun,
  ChevronDown,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CONTACT, SOCIALS, locations, pillarMenu, serviceLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import logoBlack from "@/assets/Logos/logo-black-1.png";
import logoWhite from "@/assets/Logos/logo-white.png";

const nav = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Work", "/work"],
  ["Career", "/career"],
  ["Blog", "/blog"],
] as const;
const socialIcons = { Instagram, Facebook, LinkedIn: Linkedin } as const;

export function Wordmark({
  inverse = false,
  size = "header",
}: {
  inverse?: boolean;
  size?: "header" | "footer";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const mask = {
    WebkitMaskImage: `url("${logoWhite}")`,
    maskImage: `url("${logoWhite}")`,
  } as const;

  return (
    <span className="wordmark inline-flex items-center">
      {!imageFailed && (
        <>
          {/* White logo for dark mode, or always for inverted sections like the dark footer */}
          <img
            src={logoWhite}
            width={240}
            height={62}
            alt="Macrow Digital"
            onError={() => setImageFailed(true)}
            className={cn(
              "site-wordmark w-auto object-contain",
              size === "header" ? "h-6 md:h-7" : "h-8 md:h-9",
              inverse ? "block" : "hidden [.light_&]:hidden block",
            )}
          />
          {/* Black logo for light mode */}
          {!inverse && (
            <img
              src={logoBlack}
              width={240}
              height={62}
              alt="Macrow Digital"
              onError={() => setImageFailed(true)}
              className={cn(
                "site-wordmark w-auto object-contain hidden [.light_&]:block",
                size === "header" ? "h-6 md:h-7" : "h-8 md:h-9",
              )}
            />
          )}
        </>
      )}
      {imageFailed && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            size === "header" ? "text-lg" : "text-xl",
          )}
        >
          Macrow Digital
        </span>
      )}
      {!imageFailed && <span aria-hidden="true" className="wordmark-shine" style={mask} />}
    </span>
  );
}

function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  function set(next: boolean) {
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    document.documentElement.style.colorScheme = next ? "light" : "dark";
    window.localStorage.setItem("macrow-theme", next ? "light" : "dark");
  }
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="relative flex h-8 items-center rounded-full border border-border bg-background/60 p-0.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 size-7 rounded-full bg-primary transition-transform duration-300",
          light ? "translate-x-7" : "translate-x-0",
        )}
      />
      <button
        type="button"
        role="radio"
        aria-checked={!light}
        aria-label="Dark theme"
        title="Dark theme"
        onClick={() => set(false)}
        className={cn(
          "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !light ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Moon className="size-3.5" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={light}
        aria-label="Light theme"
        title="Light theme"
        onClick={() => set(true)}
        className={cn(
          "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          light ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sun className="size-3.5" />
      </button>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    setMega(false);
    setOpen(false);
  }, [path]);
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 180);
  };
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 px-4 shadow-2xl shadow-background/60 backdrop-blur-xl">
        <Link to="/" aria-label="Macrow Digital home">
          <Wordmark />
        </Link>
        <nav aria-label="Primary navigation" className="hidden h-full items-center gap-6 lg:flex">
          {nav.map(([label, to]) =>
            label === "Services" ? (
              <div
                key={to}
                className="flex h-full items-center"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
                onKeyDown={(e) => e.key === "Escape" && setMega(false)}
              >
                <button
                  type="button"
                  aria-expanded={mega}
                  aria-haspopup="true"
                  onClick={() => setMega(!mega)}
                  className={cn(
                    "flex h-full items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive(to) && "text-foreground",
                  )}
                >
                  Services <ChevronDown className={cn("size-3 transition", mega && "rotate-180")} />
                </button>
                {mega && (
                  <div
                    className="absolute inset-x-0 top-full pt-2"
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-background/60">
                      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr_.9fr]">
                        {pillarMenu.map((p) => (
                          <div key={p.name}>
                            <p className="text-xs text-primary">360° {p.name.toUpperCase()}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                            <ul className="mt-4 grid gap-1">
                              {p.items.map(([label, id]) => (
                                <li key={id}>
                                  <Link
                                    to="/services/$slug"
                                    params={{ slug: id }}
                                    className="block rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <div className="rounded-xl border border-border bg-paper-2 p-5">
                          <p className="font-display text-lg font-semibold">Not sure which fits?</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Tell us the goal. We’ll recommend the first step in a free 30-minute
                            session.
                          </p>
                          <Button asChild size="sm" className="mt-4">
                            <Link to="/contact">Get a recommendation</Link>
                          </Button>
                          <Link
                            to="/services"
                            className="mt-3 block text-xs font-semibold text-primary underline underline-offset-4"
                          >
                            View all capabilities
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={to}
                to={to}
                className={cn(
                  "py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground",
                  isActive(to) && "text-foreground",
                )}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden lg:inline-flex">
            <Link to="/contact">Start a conversation</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Mobile navigation"
          className="fixed inset-0 -z-10 flex min-h-screen flex-col overflow-y-auto bg-background px-6 pb-8 pt-24 lg:hidden"
        >
          {nav.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="border-b border-border py-4 font-display text-2xl font-semibold"
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-3">
            {pillarMenu.map((p) => (
              <div key={p.name}>
                <p className="text-xs text-primary">{p.name}</p>
                <ul className="mt-2 grid gap-1.5 text-xs">
                  {p.items.map(([l, id]) => (
                    <li key={id}>
                      <Link to="/services/$slug" params={{ slug: id }}>
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-8">
            <Link to="/contact">
              Start a conversation <ArrowUpRight />
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const digital = serviceLinks.slice(0, 5),
    more = serviceLinks.slice(5);
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 py-16 lg:grid-cols-5 lg:px-8">
        <div className="col-span-2 lg:col-span-1">
          <Wordmark size="footer" />
          <p className="mt-4 text-sm text-muted-foreground">
            Digital, marcomm and technology planned as one growth system.
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map(([name, href]) => {
              const Icon = socialIcons[name];
              return (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Macrow Digital on ${name}`}
                  className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>
        <FooterGroup
          title="Company"
          links={[
            ["About", "/about"],
            ["Our work", "/work"],
            ["Services", "/services"],
            ["Blog", "/blog"],
            ["Career", "/career"],
            ["Partner with us", "/partner"],
          ]}
        />
        <FooterGroup title="Digital" links={digital.map(([x, id]) => [x, `/services/${id}`])} />
        <FooterGroup
          title="Marcomm & Technology"
          links={more.slice(0, 6).map(([x, id]) => [x, `/services/${id}`])}
        />
        <div>
          <h2 className="text-sm font-semibold text-primary">Connect</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Link to="/contact">Contact us</Link>
            <a className="flex items-center gap-2 break-all" href={`mailto:${CONTACT.email}`}>
              <Mail className="size-4 shrink-0 text-primary" />
              {CONTACT.email}
            </a>
            <a className="flex items-center gap-2 break-all" href={`tel:${CONTACT.phoneTel}`}>
              {CONTACT.phoneTel}
            </a>
            <Link to="/partner" className="font-semibold text-primary underline underline-offset-4">
              Become an associate partner
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-8 text-sm text-muted-foreground lg:px-8">
          <h2 className="mb-3 text-sm font-semibold text-primary">Locations</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {locations.map((l) => (
              <li key={l.city}>
                <address className="not-italic">
                  <span className="font-semibold text-foreground">{l.city}</span>
                  <br />
                  {l.region} - {l.postal}, India
                </address>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p>© 2026 Macrow Digital. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy policy
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              Cookie policy
            </Link>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => window.dispatchEvent(new Event("macrow:cookie-settings"))}
            >
              Cookie preferences
            </Button>
            <Link to="/auth" className="hover:text-foreground">
              Team access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
      <div className="mt-4 grid gap-3 text-sm">
        {links.map(([x, to]) => (
          <a key={to} href={to} className="hover:text-primary">
            {x}
          </a>
        ))}
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
  side,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  side?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="page-glow">
      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-40 lg:px-8 lg:pb-28 lg:pt-52",
          compact && "pb-10 pt-32 lg:pb-14 lg:pt-36",
          side && "lg:grid-cols-[1.3fr_.7fr] lg:items-end",
        )}
      >
        <div className={cn(!side && "mx-auto text-center")}>
          <p className="mx-auto mb-7 w-fit rounded-xl border border-border bg-card/50 px-5 py-2 text-xs font-medium">
            {eyebrow.replace(/\.$/, "")}
          </p>
          <h1 className="mx-auto max-w-5xl text-4xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <div className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
            {children}
          </div>
        </div>
        {side}
      </div>
    </section>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="max-w-3xl text-3xl font-medium sm:text-4xl lg:text-5xl">{children}</h2>
      {action}
    </div>
  );
}

export function ClosingCta() {
  return (
    <section className="page-glow border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-5 py-24 text-center lg:px-8">
        <div>
          <p className="mb-5 text-xs text-primary">FREE 30-MINUTE SESSION</p>
          <h2 className="text-4xl font-medium sm:text-6xl">
            Let’s build what’s <span className="editorial">next</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us where you are. We’ll tell you what we’d do first.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/contact">
            Start a conversation <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn(
        "overflow-hidden border-y border-border py-5",
        dark && "border-background/20 bg-foreground text-background",
      )}
    >
      <div className="marquee-track flex w-max items-center">
        {doubled.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="min-w-64 border-r border-current/20 px-8 font-display text-lg font-semibold"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccentCard({
  children,
  accent = "coral",
  className,
}: {
  children: ReactNode;
  accent?: "coral" | "green" | "gold" | undefined;
  className?: string | undefined;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        accent === "coral" && "shadow-[inset_0_2px_0_var(--primary)]",
        accent === "green" && "shadow-[inset_0_2px_0_var(--success)]",
        accent === "gold" && "shadow-[inset_0_2px_0_var(--gold)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";
