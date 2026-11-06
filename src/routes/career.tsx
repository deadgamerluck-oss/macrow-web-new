import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHero, fieldClass } from "@/components/site";
import { metadata } from "@/lib/site-data";
import { jobOpeningsQuery, type JobOpening } from "@/lib/cms";
import { applicationSchema } from "@/lib/content-schemas";
import { MathCaptcha } from "@/components/captcha";

export const Route = createFileRoute("/career")({
  head: () => metadata("Careers at Macrow Digital", "Join Macrow Digital's senior teams working across strategy, digital, marcomm and technology.", "/career"),
  component: Career,
});

function Career() {
  const { data: openings, isPending } = useQuery(jobOpeningsQuery);
  const open = (openings ?? []).filter((job) => job.is_open);
  const [roleId, setRoleId] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [human, setHuman] = useState(false);
  const [viewing, setViewing] = useState<JobOpening | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleId && open[0]) setRoleId(open[0].id);
  }, [open, roleId]);

  function choose(id: string) {
    setRoleId(id);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("resume") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (file && file.size > 8 * 1024 * 1024) {
      fileInput?.setCustomValidity("Resume must be 8MB or smaller.");
      form.reportValidity();
      return;
    }
    if (file && !/\.(pdf|doc|docx)$/i.test(file.name)) { fileInput?.setCustomValidity("Choose a PDF, DOC or DOCX resume."); form.reportValidity(); return; }
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    if (!human) { setError("Please answer the quick check question."); return; }
    const validated = applicationSchema.safeParse({ full_name: String(fields.get("full-name") ?? ""), email: String(fields.get("email") ?? ""), phone: String(fields.get("phone") ?? ""), message: String(fields.get("message") ?? "") });
    if (!validated.success) { setError("Please check your name, email, phone and message."); return; }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/apply", { method: "POST", body: fields });
      if (!response.ok) throw new Error("Application failed");
      setDone(true);
    } catch {
      setError("Something went wrong sending your application. Please try again or email career@macrowdigital.com.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Careers" title={<>Work where strategy meets <span className="editorial">execution.</span></>}>
        <p>We hire people who ask better questions than they’re asked. Small senior teams, real ownership and global clients.</p>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <h2 className="mb-3 text-4xl font-medium">{isPending ? "Open positions" : `${open.length} open position${open.length === 1 ? "" : "s"}`}</h2>
        <p className="mb-10 text-muted-foreground">Don’t see your role? Write to us anyway — we keep a bench of people we want to work with.</p>
        <div className="border-t border-border">
          {open.map((job) => (
            <article key={job.id} className="grid gap-4 border-b border-border py-7 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-xs text-primary">{job.team.toUpperCase()} · {job.employment_type} · {job.location}</p>
                <h3 className="mt-2 text-xl font-semibold">{job.title}</h3>
                {job.description && <p className="mt-2 line-clamp-2 max-w-2xl text-muted-foreground">{job.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setViewing(job)}>View details</Button>
                <Button variant="outline" onClick={() => choose(job.id)}>Apply now</Button>
              </div>
            </article>
          ))}
          {!isPending && open.length === 0 && (
            <p className="py-7 text-muted-foreground">No open roles right now — send us your details anyway and we’ll be in touch.</p>
          )}
        </div>
      </section>

      <section ref={ref} id="apply" className="scroll-mt-24 bg-paper-2">
        <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <h2 className="text-4xl font-bold">Apply to join us</h2>
          {done ? (
            <p role="status" className="mt-8 border border-success/30 bg-success/10 p-7 text-success">Thanks for applying — our team will review your application.</p>
          ) : (
            <form onSubmit={submit} className="mt-10 grid gap-5" noValidate>
              <Field label="Role" id="role">
                <select id="role" name="role" className={fieldClass} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                  {open.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" id="full-name"><input id="full-name" name="full-name" className={fieldClass} required maxLength={100} /></Field>
                <Field label="Work email" id="career-email"><input id="career-email" name="email" className={fieldClass} type="email" required maxLength={255} /></Field>
              </div>
              <Field label="Phone" id="career-phone"><input id="career-phone" name="phone" className={fieldClass} type="tel" required minLength={7} maxLength={20} /></Field>
              <Field label="Resume/CV" id="resume">
                <input id="resume" name="resume" className={`${fieldClass} py-2.5`} type="file" accept=".pdf,.doc,.docx" required onChange={(e) => e.currentTarget.setCustomValidity("")} />
                <span className="mt-2 block text-xs text-muted-foreground">PDF, DOC or DOCX. Maximum 8MB.</span>
              </Field>
               <Field label="Message (optional)" id="career-message"><textarea id="career-message" name="message" className={`${fieldClass} fixed-message py-3`} maxLength={1500} /></Field>
              <MathCaptcha id="career-captcha" onValid={setHuman} />
              {error && <p role="alert" className="text-sm text-primary">{error}</p>}
              <Button type="submit" size="lg" className="justify-self-start" disabled={busy}>{busy ? "Sending…" : "Submit application"}</Button>
            </form>
          )}
        </div>
      </section>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>{viewing ? `${viewing.team} · ${viewing.employment_type} · ${viewing.location}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto whitespace-pre-line leading-8">{viewing?.description || "Details for this role will be shared during the first conversation."}</div>
          {viewing && <Button onClick={() => { setViewing(null); choose(viewing.id); }}>Apply for this role</Button>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return <div><label htmlFor={id} className="text-sm font-semibold">{label}</label>{children}</div>;
}
