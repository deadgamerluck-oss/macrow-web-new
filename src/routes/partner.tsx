import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Handshake, Layers, Globe2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AccentCard, PageHero, fieldClass } from "@/components/site";
import { submitPartnerEnquiry } from "@/lib/public-submissions.functions";
import { metadata } from "@/lib/site-data";
import { MathCaptcha } from "@/components/captcha";

export const Route = createFileRoute("/partner")({
  head: () => metadata("Partner with Macrow Digital — Associate & Collaboration Programme", "Agencies, consultants and technology firms can collaborate with Macrow Digital as associate partners to deliver digital, marcomm and technology services.", "/partner"),
  component: Partner,
});

const models = [
  [Handshake, "Associate partner", "Deliver Macrow services to your clients under a shared engagement model."],
  [Layers, "Capability collaboration", "Combine your specialism with our digital, marcomm and technology teams."],
  [Globe2, "Referral & market partner", "Introduce opportunities in your city or market and grow together."],
] as const;

function Partner() {
  const submitPartner = useServerFn(submitPartnerEnquiry);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [human, setHuman] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    if (!human) return setState("error");
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    setState("busy");
    try {
      await submitPartner({ data: { company: get("company"), contact_name: get("name"), email: get("email"), phone: get("phone"), website: get("website"), partnership_type: get("type"), message: get("message"), honeypot: String(f.get("website_confirm") ?? "") } });
      setState("done");
    } catch { setState("error"); }
  }
  return <>
    <PageHero compact eyebrow="Collaborate" title={<>Grow with us as an <span className="editorial">associate partner.</span></>}><p>For agencies, consultants and technology companies who want to serve clients together with Macrow Digital.</p></PageHero>
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8"><div className="grid gap-4 md:grid-cols-3">{models.map(([Icon, t, d], i) => <AccentCard key={t} accent={(["coral", "green", "gold"] as const)[i]}><Icon className="size-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">{t}</h2><p className="mt-3 leading-7 text-muted-foreground">{d}</p></AccentCard>)}</div></section>
    <section className="mx-auto max-w-3xl px-5 pb-28 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        {state === "done" ? <div role="status" className="rounded-2xl border border-success/30 bg-success/10 p-7"><h2 className="text-2xl font-bold text-success">Request received.</h2><p className="mt-3">Thanks — our partnerships team will get in touch shortly.</p></div> :
        <form onSubmit={submit} noValidate className="grid gap-5">
          <h2 className="text-2xl font-semibold">Partnership request</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <F id="company" label="Company name"><input id="company" name="company" required maxLength={150} className={fieldClass} /></F>
            <F id="name" label="Your name"><input id="name" name="name" required maxLength={100} className={fieldClass} /></F>
            <F id="email" label="Work email"><input id="email" name="email" type="email" required maxLength={255} className={fieldClass} /></F>
            <F id="phone" label="Phone"><input id="phone" name="phone" type="tel" required minLength={7} maxLength={20} className={fieldClass} /></F>
            <F id="website" label="Website (optional)"><input id="website" name="website" type="url" maxLength={255} placeholder="https://" className={fieldClass} /></F>
            <F id="type" label="Partnership type"><select id="type" name="type" className={fieldClass} defaultValue="Associate partner">{models.map(([, t]) => <option key={t}>{t}</option>)}<option>Other</option></select></F>
          </div>
          <F id="message" label="Tell us about your company and how you’d like to collaborate"><textarea id="message" name="message" required maxLength={2000} className={`${fieldClass} fixed-message py-3`} /></F>
          <MathCaptcha id="partner-captcha" onValid={setHuman} />
          {state === "error" && <p role="alert" className="text-sm text-primary">Something went wrong. Please check the quick-check answer and try again, or email growth@macrowdigital.com.</p>}
          <Button type="submit" size="lg" className="justify-self-start" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send partnership request"}</Button>
        </form>}
      </div>
    </section>
  </>;
}

function F({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="text-sm font-semibold">{label}</label>{children}</div>;
}
