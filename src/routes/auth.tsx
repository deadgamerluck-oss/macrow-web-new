import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PageHero, fieldClass } from "@/components/site";
import { metadata } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () =>
    metadata("Team sign in — Macrow Digital", "Sign in to manage Macrow Digital enquiries, applications, insights and open roles."),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    void navigate({ to: "/admin" });
  }

  return (
    <>
      <PageHero eyebrow="Team access" title={<>Sign in to the <span className="editorial">workspace.</span></>}>
        <p>For the Macrow Digital team. Enquiries, applications, insights and open roles live here.</p>
      </PageHero>
      <section className="mx-auto max-w-md px-5 pb-28 lg:px-8">
        <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-border bg-card p-7" noValidate>
          <div>
            <label htmlFor="auth-email" className="text-sm font-semibold">Work email</label>
            <input id="auth-email" className={fieldClass} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-sm font-semibold">Password</label>
            <input id="auth-password" className={fieldClass} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {status && <p role="alert" className="rounded-xl border border-border bg-background p-4 text-sm">{status}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          <Button type="button" variant="link" onClick={async () => {
            if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus("Enter your work email above first."); return; }
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
            setStatus(error ? error.message : "If this email has an account, a password reset link has been sent.");
          }}>Forgot password?</Button>
        </form>
      </section>
    </>
  );
}
