import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterManager() {
  const { data = [], isPending, isError } = useQuery({ queryKey: ["newsletter_subscribers"], queryFn: async () => {
    const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } });
  function download() {
    const csv = "Email,Consent date\n" + data.map(row => `${row.email},${row.consent_at}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "macrow-newsletter-subscribers.csv"; link.click(); URL.revokeObjectURL(url);
  }
  return <section><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl font-semibold">Newsletter subscribers · {data.length}</h2><Button variant="outline" onClick={download} disabled={!data.length}><Download /> Export CSV</Button></div>
    {isPending ? <p>Loading subscribers…</p> : isError ? <p role="alert">Unable to load subscribers. Please try again.</p> : !data.length ? <p className="text-muted-foreground">No subscribers yet.</p> : <div className="divide-y divide-border">{data.map(row => <article key={row.id} className="flex flex-wrap justify-between gap-3 py-4"><span className="break-all">{row.email}</span><time className="text-sm text-muted-foreground">{new Date(row.consent_at).toLocaleDateString()}</time></article>)}</div>}
  </section>;
}