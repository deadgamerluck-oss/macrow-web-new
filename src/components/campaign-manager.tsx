import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fieldClass } from "@/components/site";
import { CampaignDialog } from "@/components/visitor-experience";
import { listAdminCampaigns, saveCampaign, deleteCampaign } from "@/lib/campaigns.functions";
import { ImageUploadField } from "@/components/image-upload";
import type { Campaign } from "@/lib/campaigns";

const empty = { name: "", title: "", description: "", cta_text: "Start a conversation", image_url: "", kind: "lead", trigger_type: "delay", delay_seconds: 25, scroll_percent: 50, cooldown_days: 7, target_path: "*", cta_path: "/contact", is_active: false, sort_order: 0, starts_at: null, ends_at: null };
type Draft = Omit<typeof empty, "starts_at" | "ends_at"> & { id?: string; starts_at: string | null; ends_at: string | null };

export function CampaignManager() {
  const queryClient = useQueryClient();
  const list = useServerFn(listAdminCampaigns), save = useServerFn(saveCampaign), remove = useServerFn(deleteCampaign);
  const { data = [], isPending, error } = useQuery({ queryKey: ["admin-campaigns"], queryFn: () => list() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [preview, setPreview] = useState<Campaign | null>(null);
  const [notice, setNotice] = useState("");
  const invalidate = async () => { await queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }); await queryClient.invalidateQueries({ queryKey: ["public-campaigns"] }); };
  const persist = useMutation({ mutationFn: (value: Draft) => save({ data: value }), onSuccess: async () => { setDraft(null); setNotice("Campaign saved."); await invalidate(); } });
  const deletion = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: invalidate });
  const edit = (row: Campaign): Draft => ({ ...row, image_url: row.image_url ?? "" });
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (draft && e.currentTarget.reportValidity()) persist.mutate(draft); }
  const change = (key: keyof Draft, value: string | number | boolean | null) => { if (draft) setDraft({ ...draft, [key]: value }); };
  return <div className="grid gap-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">Popup campaigns</h2><p className="mt-2 text-sm text-muted-foreground">Lead enquiries appear in Enquiries. Visitors see at most one popup per session, after cookie choices.</p></div><Button onClick={() => { setDraft({ ...empty, sort_order: data.length }); setNotice(""); }}><Plus />New campaign</Button></div>
    {notice && <p role="status" className="text-sm text-success">{notice}</p>}
    {(error || persist.isError || deletion.isError) && <p role="alert" className="text-sm text-destructive">{persist.error?.message || deletion.error?.message || "Campaigns couldn’t be loaded. Please try again."}</p>}
    {draft && <form onSubmit={submit} className="grid gap-5 rounded-lg border border-border bg-card p-6"><h3 className="text-xl font-semibold">{draft.id ? "Edit campaign" : "New campaign"}</h3><div className="grid gap-4 sm:grid-cols-2">
      {([['name','Internal name'],['title','Popup headline'],['cta_text','Button text']] as const).map(([key,label]) => <label key={key} className="text-sm font-semibold">{label}<input className={fieldClass} value={draft[key]} required type="text" maxLength={key === "title" ? 160 : 100} onChange={e => change(key,e.target.value)} /></label>)}
      <ImageUploadField id="campaign-image" label="Popup image (optional)" value={draft.image_url} onChange={v => change("image_url", v)} />
      <label className="text-sm font-semibold sm:col-span-2">Description<textarea className={`${fieldClass} min-h-24 py-3`} value={draft.description} required maxLength={600} onChange={e => change("description",e.target.value)} /></label>
      <label className="text-sm font-semibold">Popup type<select className={fieldClass} value={draft.kind} onChange={e => change("kind",e.target.value)}><option value="lead">Lead enquiry form</option><option value="announcement">Announcement</option></select></label>
      <label className="text-sm font-semibold">Trigger<select className={fieldClass} value={draft.trigger_type} onChange={e => change("trigger_type",e.target.value)}><option value="delay">Time on page</option><option value="scroll">Scroll depth</option><option value="exit">Exit intent (desktop)</option></select></label>
      {draft.trigger_type === "delay" && <label className="text-sm font-semibold">Delay (seconds)<input className={fieldClass} type="number" min={5} max={300} required value={draft.delay_seconds} onChange={e => change("delay_seconds",Number(e.target.value))} /></label>}
      {draft.trigger_type === "scroll" && <label className="text-sm font-semibold">Scroll depth (%)<input className={fieldClass} type="number" min={10} max={95} required value={draft.scroll_percent} onChange={e => change("scroll_percent",Number(e.target.value))} /></label>}
      <label className="text-sm font-semibold">Repeat after (days)<input className={fieldClass} type="number" min={1} max={90} required value={draft.cooldown_days} onChange={e => change("cooldown_days",Number(e.target.value))} /></label>
      <label className="text-sm font-semibold">Show on<select className={fieldClass} value={draft.target_path} onChange={e => change("target_path",e.target.value)}>{[['*','All public pages'],['/','Home'],['/about','About'],['/services','Services'],['/work','Work'],['/blog','Blog'],['/career','Career'],['/partner','Partners']].map(([v,l]) => <option value={v} key={v}>{l}</option>)}</select></label>
      {draft.kind === "announcement" && <label className="text-sm font-semibold">Button destination<select className={fieldClass} value={draft.cta_path} onChange={e => change("cta_path",e.target.value)}>{['contact','services','work','about','partner','career','blog'].map(v => <option key={v} value={`/${v}`}>{v}</option>)}</select></label>}
      <label className="text-sm font-semibold">Priority (lowest first)<input className={fieldClass} type="number" min={0} max={1000} value={draft.sort_order} required onChange={e => change("sort_order",Number(e.target.value))} /></label>
      {([['starts_at','Starts at (optional)'],['ends_at','Ends at (optional)']] as const).map(([key,label]) => <label key={key} className="text-sm font-semibold">{label}<input className={fieldClass} type="datetime-local" value={draft[key] ? localDate(draft[key]) : ""} onChange={e => change(key,e.target.value ? new Date(e.target.value).toISOString() : null)} /></label>)}
    </div><label className="flex items-center gap-3 text-sm font-semibold"><Switch checked={draft.is_active} onCheckedChange={v => change("is_active",v)} />Campaign active</label><div className="flex gap-3"><Button type="submit" disabled={persist.isPending}>{persist.isPending ? "Saving…" : "Save campaign"}</Button><Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></form>}
    {isPending ? <p className="text-muted-foreground">Loading campaigns…</p> : !data.length ? <p className="text-muted-foreground">No campaigns yet.</p> : <div className="grid gap-4">{data.map(row => <article key={row.id} className="flex flex-col justify-between gap-5 rounded-lg border border-border bg-card p-6 sm:flex-row"><div className="min-w-0"><p className="text-xs text-primary">{row.is_active ? "Active" : "Paused"} · {row.kind === "lead" ? "Lead form" : "Announcement"} · {row.trigger_type} · {row.target_path}</p><h3 className="mt-2 text-xl font-semibold">{row.name}</h3><p className="mt-2 text-sm text-muted-foreground">{row.title}</p></div><div className="flex shrink-0 items-start gap-2"><Switch checked={row.is_active} disabled={persist.isPending} aria-label={`Activate ${row.name}`} onCheckedChange={v => persist.mutate({ ...edit(row), is_active: v })} /><Button variant="outline" size="icon" title="Preview popup" aria-label={`Preview ${row.name}`} onClick={() => setPreview(row)}><Eye /></Button><Button variant="outline" size="icon" title="Edit campaign" aria-label={`Edit ${row.name}`} onClick={() => { setDraft(edit(row)); setNotice(""); }}><Pencil /></Button><Button variant="outline" size="icon" title="Delete campaign" aria-label={`Delete ${row.name}`} disabled={deletion.isPending} onClick={() => { if (confirm(`Delete “${row.name}”?`)) deletion.mutate(row.id); }}><Trash2 /></Button></div></article>)}</div>}
    {preview && <CampaignDialog campaign={preview} open preview onClose={() => setPreview(null)} />}
  </div>;
}
function localDate(iso: string) { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16); }