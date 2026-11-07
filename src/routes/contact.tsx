import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AccentCard, PageHero, fieldClass } from "@/components/site";
import { CONTACT, metadata } from "@/lib/site-data";
import { submitContactEnquiry } from "@/lib/public-submissions.functions";
import { contactSchema } from "@/lib/content-schemas";
import { MathCaptcha } from "@/components/captcha";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { goal?: string } =>
    typeof search["goal"] === "string" ? { goal: search["goal"] } : {},
  head: () =>
    metadata(
      "Contact Macrow Digital — Start a Conversation",
      "Tell Macrow Digital where you are and what you are trying to reach. Start with a free growth consultation.",
      "/contact",
    ),
  component: Contact,
});

function Contact() {
  const { goal } = Route.useSearch();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [human, setHuman] = useState(false);
  const submitContact = useServerFn(submitContactEnquiry);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!human) {
      setError("Please answer the quick check question.");
      return;
    }
    const fields = new FormData(form);
    const name = String(fields.get("name") ?? "");
    const email = String(fields.get("email") ?? "");
    const validated = contactSchema.safeParse({
      name,
      email,
      phone: String(fields.get("phone") ?? ""),
      budget: String(fields.get("budget") ?? ""),
      message: String(fields.get("message") ?? ""),
    });
    if (!validated.success) {
      setError("Please check your name, email, phone and message.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitContact({
        data: {
          name,
          email,
          phone: String(fields.get("phone") ?? ""),
          budget: String(fields.get("budget") ?? ""),
          message: String(fields.get("message") ?? ""),
          source: "Contact page",
          website: String(fields.get("website") ?? ""),
        },
      });
    } catch {
      setBusy(false);
      setError(
        "Something went wrong sending your message. Please try again or email growth@macrowdigital.com.",
      );
      return;
    }
    setBusy(false);
    setDone(true);
  }

  return (
    <>
      <PageHero
        compact
        eyebrow="Start here"
        title={
          <>
            Partner with <span className="editorial">Macrow.</span>
          </>
        }
      >
        <p>
          Bring us your product, roadmap or problem. No brief needed — just tell us what you're
          trying to achieve.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-5xl gap-7 px-5 pb-28 lg:grid-cols-[1.35fr_.85fr] lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
          {done ? (
            <div role="status" className="rounded-2xl border border-success/30 bg-success/10 p-7">
              <h2 className="text-2xl font-bold text-success">Message received.</h2>
              <p className="mt-3">
                Thanks for reaching out — our team will get back to you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" id="name">
                  <input id="name" name="name" className={fieldClass} required maxLength={100} />
                </Field>
                <Field label="Email" id="email">
                  <input
                    id="email"
                    name="email"
                    className={fieldClass}
                    type="email"
                    required
                    maxLength={255}
                  />
                </Field>
                <Field label="Phone" id="phone">
                  <input
                    id="phone"
                    name="phone"
                    className={fieldClass}
                    type="tel"
                    required
                    minLength={7}
                    maxLength={20}
                  />
                </Field>
                <Field label="Monthly budget" id="budget">
                  <select id="budget" name="budget" className={fieldClass} defaultValue="">
                    <option value="">Not sure yet</option>
                    <option>Under ₹50,000</option>
                    <option>₹50,000 – ₹1,50,000</option>
                    <option>₹1,50,000 – ₹5,00,000</option>
                    <option>₹5,00,000+</option>
                  </select>
                </Field>
              </div>
              <Field label="What would you like to achieve?" id="message">
                <textarea
                  key={goal}
                  id="message"
                  name="message"
                  className={`${fieldClass} fixed-message py-3`}
                  required
                  maxLength={1500}
                  defaultValue={goal ? `I'm interested in ${goal}. ` : ""}
                  placeholder="A few lines are enough to start."
                />
              </Field>
              <MathCaptcha id="contact-captcha" onValid={setHuman} />
              {error && (
                <p role="alert" className="text-sm text-primary">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" className="justify-self-start" disabled={busy}>
                {busy ? "Sending…" : "Start a conversation"}
              </Button>
            </form>
          )}
        </div>
        <aside className="grid content-start gap-4">
          {[
            {
              title: "Contact us directly",
              email: CONTACT.email,
              phone: CONTACT.phoneDisplay,
              phoneTel: CONTACT.phoneTel,
            },
            {
              title: "Offices",
              text: "Jaipur 302020 · Ahmedabad 380008 · Patna 800014",
            },
            {
              title: "Reach",
              text: "Working globally across fourteen sectors",
            },
            {
              title: "First conversation",
              text: "Tell us your goal; we'll help make sense of the next step.",
            },
          ].map((item, i) => (
            <AccentCard key={item.title} accent={(["coral", "green", "gold", "coral"] as const)[i]}>
              <h2 className="text-sm font-semibold text-muted-foreground">{item.title}</h2>
              <p className="mt-3 font-medium leading-7 flex flex-col gap-1">
                {"email" in item ? (
                  <>
                    <a
                      className="break-all text-primary underline underline-offset-4"
                      href={`mailto:${item.email}`}
                    >
                      {item.email}
                    </a>
                    <a
                      className="text-primary underline underline-offset-4"
                      href={`tel:${item.phoneTel}`}
                    >
                      {item.phone}
                    </a>
                  </>
                ) : (
                  item.text
                )}
              </p>
            </AccentCard>
          ))}
        </aside>
      </section>
    </>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
