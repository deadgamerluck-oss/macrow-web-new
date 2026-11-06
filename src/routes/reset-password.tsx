import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PageHero, fieldClass } from "@/components/site";
import { metadata } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => {
    const m = metadata("Set a new password — Macrow Digital", "Choose a new password for your Macrow Digital team account.");
    return { ...m, meta: [...m.meta, { name: "robots", content: "noindex" }] };
  },
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 8) { setStatus("Use at least 8 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setStatus(error.message); return; }
    void navigate({ to: "/admin" });
  }
  return (
    <>
      <PageHero eyebrow="Team access" title={<>Set a new <span className="editorial">password.</span></>}><p>Open this page from the reset link in your email.</p></PageHero>
      <section className="mx-auto max-w-md px-5 pb-28 lg:px-8">
        <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-border bg-card p-7">
          <div><label htmlFor="new-password" className="text-sm font-semibold">New password</label>
          <input id="new-password" className={fieldClass} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></div>
          {status && <p role="alert" className="rounded-xl border border-border bg-background p-4 text-sm">{status}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
        </form>
      </section>
    </>
  );
}
