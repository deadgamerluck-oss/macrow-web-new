import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Cookie, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { fieldClass } from "@/components/site";
import { submitContactEnquiry } from "@/lib/public-submissions.functions";
import { publicCampaignsQuery, readPreference, savePreference, type Campaign } from "@/lib/campaigns";
import { SiteImage } from "@/lib/site-images";
import strategyPhoto from "@/assets/digital-strategy.webp";
import { ChatAssistant } from "@/components/chat-assistant";
import { BackToTop } from "@/components/back-to-top";

const CONSENT_KEY = "macrow-consent-v1";
type Consent = { necessary: true; analytics: boolean; marketing: boolean; updatedAt: string };
function destination(path: string) {
  switch (path) {
    case "/services": case "/work": case "/about": case "/partner": case "/career": case "/blog": return path;
    default: return "/contact";
  }
}

export function CookiePreferences({ onResolved }: { onResolved: (value: boolean) => void }) {
  const [banner, setBanner] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    let consent: Consent | null = null;
    try { const raw = readPreference(CONSENT_KEY); if (raw) consent = JSON.parse(raw); } catch { /* Show fresh choices for invalid consent. */ }
    const valid = consent?.necessary === true && Date.now() - Date.parse(consent.updatedAt) < 180 * 86400000;
    setBanner(!valid); onResolved(valid);
    if (valid && consent) { setAnalytics(consent.analytics); setMarketing(consent.marketing); }
    const open = () => setSettings(true);
    window.addEventListener("macrow:cookie-settings", open);
    return () => window.removeEventListener("macrow:cookie-settings", open);
  }, [onResolved]);
  function save(a: boolean, m: boolean) {
    const consent: Consent = { necessary: true, analytics: a, marketing: m, updatedAt: new Date().toISOString() };
    savePreference(CONSENT_KEY, JSON.stringify(consent));
    setAnalytics(a); setMarketing(m); setBanner(false); setSettings(false); onResolved(true);
    window.dispatchEvent(new CustomEvent("macrow:consent-changed", { detail: consent }));
  }
  return <>
    {banner && <aside aria-label="Cookie preferences" className="cookie-banner fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-5xl rounded-lg border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:flex sm:items-center sm:gap-6">
      <Cookie className="hidden size-7 shrink-0 text-primary sm:block" />
      <div className="flex-1"><h2 className="text-sm font-semibold">A little cookie clarity.</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Essential storage keeps things working. Optional cookies are your choice. <Link to="/privacy" className="text-foreground underline underline-offset-2">Privacy policy</Link> · <Link to="/cookies" className="text-foreground underline underline-offset-2">Cookie policy</Link></p></div>
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0"><Button size="sm" variant="ghost" onClick={() => setSettings(true)}>Preferences</Button><Button size="sm" variant="outline" onClick={() => save(false, false)}>Reject optional</Button><Button size="sm" variant="outline" onClick={() => save(true, true)}>Accept all</Button></div>
    </aside>}
    <Dialog open={settings} onOpenChange={setSettings}><DialogContent className="max-w-md rounded-lg"><DialogHeader><ShieldCheck className="mb-3 size-7 text-primary" /><DialogTitle>Your privacy, your choice.</DialogTitle><DialogDescription>Only essential storage is used until you choose otherwise.</DialogDescription></DialogHeader><div className="grid gap-5 py-4">
      <div className="flex items-center justify-between gap-4"><div><h3 className="text-sm font-semibold">Essential</h3><p className="text-xs text-muted-foreground">Security, theme and saved preferences.</p></div><Switch checked disabled aria-label="Essential storage always enabled" /></div>
      <div className="flex items-center justify-between gap-4"><div><h3 className="text-sm font-semibold">Analytics</h3><p className="text-xs text-muted-foreground">Optional audience measurement.</p></div><Switch checked={analytics} onCheckedChange={setAnalytics} aria-label="Analytics cookies" /></div>
      <div className="flex items-center justify-between gap-4"><div><h3 className="text-sm font-semibold">Marketing</h3><p className="text-xs text-muted-foreground">Optional advertising measurement.</p></div><Switch checked={marketing} onCheckedChange={setMarketing} aria-label="Marketing cookies" /></div>
      <p className="text-xs leading-5 text-muted-foreground">No optional analytics or advertising scripts are currently installed.</p>
    </div><Button onClick={() => save(analytics, marketing)}>Save preferences</Button><Link to="/privacy" onClick={() => setSettings(false)} className="text-center text-xs text-muted-foreground underline">Read our privacy policy</Link></DialogContent></Dialog>
  </>;
}

export function CampaignDialog({ campaign, open, onClose, preview = false }: { campaign: Campaign; open: boolean; onClose: () => void; preview?: boolean }) {
  const submitContact = useServerFn(submitContactEnquiry);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  useEffect(() => { setState("idle"); }, [campaign.id, open]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || preview) return;
    const values = new FormData(event.currentTarget);
    if (values.get("website")) return;
    setState("busy");
    try {
      await submitContact({ data: { name: String(values.get("name") ?? "").trim(), email: String(values.get("email") ?? "").trim(), phone: String(values.get("phone") ?? ""), message: String(values.get("message") || "Strategy conversation requested"), source: "Campaign popup", website: String(values.get("website") ?? "") } });
      setState("done");
    } catch { setState("error"); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="campaign-dialog max-h-[90svh] max-w-2xl overflow-y-auto rounded-lg p-0">
    <div className="relative h-40 overflow-hidden sm:h-48">{campaign.image_url ? <SiteImage src={campaign.image_url} alt="Campaign visual" className="size-full object-cover" /> : <img src={strategyPhoto} alt="Creative strategy and campaign planning" width={1408} height={960} className="size-full object-cover" />}<span className="absolute bottom-4 left-6 inline-flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-xs text-foreground"><Sparkles className="size-3.5 text-primary" />{preview ? "Campaign preview" : "A conversation worth having"}</span></div>
    <div className="p-6 sm:p-8"><DialogHeader><DialogTitle className="pr-3 text-3xl font-medium">{state === "done" ? "A good conversation starts here." : campaign.title}</DialogTitle><DialogDescription className="pt-2 text-sm leading-6">{state === "done" ? "Thanks for reaching out. Your details are with our team." : campaign.description}</DialogDescription></DialogHeader>
      {state === "done" ? <Button className="mt-6" onClick={onClose}>Back to exploring <ArrowUpRight /></Button> : campaign.kind === "lead" ? <form onSubmit={submit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Your name<input name="name" aria-label="Your name" autoComplete="name" required maxLength={100} className={fieldClass} /></label><label className="text-xs font-semibold">Work email<input name="email" aria-label="Popup work email" type="email" autoComplete="email" required maxLength={255} className={fieldClass} /></label></div>
        <label className="text-xs font-semibold">What would you like to grow?<textarea name="message" aria-label="What would you like to grow?" maxLength={1500} className={`${fieldClass} min-h-20 py-3`} /></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input type="checkbox" required className="mt-1" /> <span>I agree to be contacted about my enquiry and have read the <Link to="/privacy" onClick={onClose} className="text-foreground underline">privacy policy</Link>.</span></label>
        {state === "error" && <p role="alert" className="text-sm text-destructive">We couldn’t save your enquiry. Please try again.</p>}
        <Button type="submit" disabled={state === "busy" || preview}>{state === "busy" ? "Sending…" : campaign.cta_text}<ArrowUpRight /></Button>
      </form> : <Button asChild className="mt-6"><Link to={destination(campaign.cta_path)} onClick={onClose}>{campaign.cta_text}<ArrowUpRight /></Link></Button>}
    </div>
  </DialogContent></Dialog>;
}

export function VisitorExperience() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [consentReady, setConsentReady] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const { data = [] } = useQuery(publicCampaignsQuery);
  const shown = useRef(false);
  const excluded = pathname === "/contact" || pathname.startsWith("/admin") || pathname === "/auth" || pathname === "/privacy" || pathname === "/cookies";
  useEffect(() => {
    if (!consentReady || excluded || shown.current) return;
    try { if (sessionStorage.getItem("macrow-popup-session")) return; } catch { /* Use in-memory session guard. */ }
    const next = data.find(c => (c.target_path === "*" || c.target_path === pathname || (c.target_path === "/services" && pathname.startsWith("/services/"))) && Date.now() - Number(readPreference(`macrow-popup-${c.id}`) || 0) >= c.cooldown_days * 86400000);
    if (!next) return;
    function show() {
      if (shown.current || document.querySelector('[role="dialog"]') || document.activeElement?.matches("input,textarea,select")) return;
      shown.current = true;
      savePreference(`macrow-popup-${next?.id}`, String(Date.now()));
      try { sessionStorage.setItem("macrow-popup-session", "shown"); } catch { /* In-memory fallback remains active. */ }
      setCampaign(next ?? null);
    }
    const start = Date.now();
    const timer = next.trigger_type === "delay" ? window.setTimeout(show, next.delay_seconds * 1000) : undefined;
    const scroll = () => { const range = document.documentElement.scrollHeight - innerHeight; if (range > 0 && scrollY / range * 100 >= next.scroll_percent && Date.now() - start > 5000) show(); };
    const exit = (event: MouseEvent) => { if (event.clientY <= 0 && Date.now() - start > 10000 && matchMedia("(pointer:fine)").matches) show(); };
    if (next.trigger_type === "scroll") window.addEventListener("scroll", scroll, { passive: true });
    if (next.trigger_type === "exit") document.addEventListener("mouseleave", exit);
    return () => { if (timer) clearTimeout(timer); window.removeEventListener("scroll", scroll); document.removeEventListener("mouseleave", exit); };
  }, [data, pathname, consentReady, excluded]);
  const publicPage = !pathname.startsWith("/admin") && pathname !== "/auth" && pathname !== "/reset-password";
  return <><CursorFlair /><ScrollReveals pathname={pathname} />{!pathname.startsWith("/admin") && pathname !== "/auth" && <CookiePreferences onResolved={setConsentReady} />}{campaign && <CampaignDialog campaign={campaign} open onClose={() => setCampaign(null)} />}{publicPage && <ChatAssistant bannerOpen={!consentReady} />}{publicPage && consentReady && <BackToTop />}</>;
}

function CursorFlair() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!media.matches) return;
    const element = ref.current;
    if (!element) return;
    let x = -100, y = -100, currentX = -100, currentY = -100, frame = 0;
    const move = (event: PointerEvent) => { x = event.clientX; y = event.clientY; element.dataset["visible"] = "true"; element.dataset["active"] = String(!!(event.target as Element).closest("a,button,[role=button]")); if (!frame) frame = Math.abs(x - currentX) + Math.abs(y - currentY) > 0.5 ? requestAnimationFrame(animate) : 0; };
    const leave = () => { element.dataset["visible"] = "false"; cancelAnimationFrame(frame); frame = 0; };
    const animate = () => { currentX += (x - currentX) * 0.22; currentY += (y - currentY) * 0.22; element.style.transform = `translate3d(${currentX}px,${currentY}px,0)`; frame = Math.abs(x - currentX) + Math.abs(y - currentY) > 0.5 ? requestAnimationFrame(animate) : 0; };
    window.addEventListener("pointermove", move, { passive: true }); document.addEventListener("mouseleave", leave);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); document.removeEventListener("mouseleave", leave); };
  }, []);
  return <div ref={ref} className="cursor-flair" aria-hidden="true"><span /></div>;
}

function ScrollReveals({ pathname }: { pathname: string }) {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    // Web Animations keep reveals off React-owned attributes, so hydration never sees changed class names.
    const seen = new WeakSet<Element>();
    const pending = new Map<Element, Animation>();
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { const animation = pending.get(entry.target); if (entry.isIntersecting && animation) { animation.play(); pending.delete(entry.target); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    const scan = () => document.querySelectorAll("main section > div, main section > ol, main section > h2").forEach(el => {
      if (seen.has(el)) return; seen.add(el);
      if (el.getBoundingClientRect().top <= innerHeight) return;
      const animation = el.animate([{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" });
      animation.pause(); animation.onfinish = () => animation.cancel();
      pending.set(el, animation); observer.observe(el);
    });
    scan();
    const mutations = new MutationObserver(scan); mutations.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); pending.forEach(animation => animation.cancel()); pending.clear(); };
  }, [pathname]);
  return null;
}
