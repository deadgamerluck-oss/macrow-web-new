import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Bot, Briefcase, FileText, FolderKanban, Handshake, Images, LayoutDashboard, Mail, MailPlus, Megaphone, MessageSquareQuote, Users, Wrench, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fieldClass } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminAccess } from "@/lib/admin.functions";
import {
  blogPostsQuery,
  contactSubmissionsQuery,
  jobApplicationsQuery,
  jobOpeningsQuery,
  partnerApplicationsQuery,
  testimonialsQuery,
  workProjectsQuery,
  clientLogosQuery,
  resumeDownloadUrl,
  type BlogPost,
  type JobOpening,
} from "@/lib/cms";
import { metadata } from "@/lib/site-data";
import { CampaignManager } from "@/components/campaign-manager";
import { NewsletterManager } from "@/components/newsletter-manager";
import { ChatbotManager } from "@/components/chatbot-manager";
import { MaintenanceManager } from "@/components/maintenance-manager";
import { postSchema } from "@/lib/content-schemas";
import { ImageUploadField } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-editor";
import { SiteImage } from "@/lib/site-images";
import { blogCover } from "@/lib/blog-images";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => metadata("Workspace — Macrow Digital", "Manage enquiries, applications, insights and open roles."),
  component: Admin,
});

const NAV: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "enquiries", label: "Enquiries", icon: Mail },
  { value: "popups", label: "Popups", icon: Megaphone },
  { value: "assistant", label: "AI assistant", icon: Bot },
  { value: "applications", label: "Applications", icon: Briefcase },
  { value: "posts", label: "Insights", icon: FileText },
  { value: "newsletter", label: "Newsletter", icon: MailPlus },
  { value: "jobs", label: "Open roles", icon: Users },
  { value: "partners", label: "Partners", icon: Handshake },
  { value: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { value: "work", label: "Our work", icon: FolderKanban },
  { value: "logos", label: "Client logos", icon: Images },
  { value: "maintenance", label: "Maintenance", icon: Wrench },
];

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(ensureAdminAccess);
  const access = useQuery({ queryKey: ["admin-access"], queryFn: () => checkAdmin({ data: undefined }) });
  const [tab, setTab] = useState("overview");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-28 pt-32 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Everything on your website, managed from one place.</p>
        </div>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
      {access.isPending && <p className="text-muted-foreground">Checking your access…</p>}
      {access.data && !access.data.isAdmin && (
        <p className="rounded-2xl border border-border bg-card p-7">
          This account does not have workspace access yet. Ask a colleague with access to add you.
        </p>
      )}
      {access.data?.isAdmin && (
        <Tabs value={tab} onValueChange={setTab} className="lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
          <TabsList className="mb-8 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0 lg:sticky lg:top-28 lg:mb-0 lg:flex-col lg:items-stretch">
            {NAV.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="justify-start gap-2.5 rounded-xl px-4 py-2.5 text-sm data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none lg:w-full"
              >
                <item.icon className="size-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="min-w-0">
            <TabsContent value="overview"><Overview go={setTab} /></TabsContent>
            <TabsContent value="enquiries"><Enquiries /></TabsContent>
            <TabsContent value="popups"><CampaignManager /></TabsContent>
            <TabsContent value="assistant"><ChatbotManager /></TabsContent>
            <TabsContent value="applications"><Applications /></TabsContent>
            <TabsContent value="posts"><Posts /></TabsContent>
            <TabsContent value="newsletter"><NewsletterManager /></TabsContent>
            <TabsContent value="jobs"><Jobs /></TabsContent>
            <TabsContent value="partners"><Partners /></TabsContent>
            <TabsContent value="testimonials"><ContentManager config={testimonialConfig} /></TabsContent>
            <TabsContent value="work"><ContentManager config={workConfig} /></TabsContent>
            <TabsContent value="logos"><ContentManager config={logoConfig} /></TabsContent>
            <TabsContent value="maintenance"><MaintenanceManager /></TabsContent>
          </div>
        </Tabs>
      )}
    </main>
  );
}

function useCount(queryKey: string, table: "contact_submissions" | "job_applications" | "partner_applications" | "newsletter_subscribers" | "blog_posts" | "work_projects" | "testimonials" | "client_logos" | "job_openings") {
  const { data } = useQuery({
    queryKey: ["count", queryKey],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  return data;
}

function Overview({ go }: { go: (tab: string) => void }) {
  const enquiries = useCount("enquiries", "contact_submissions");
  const applications = useCount("applications", "job_applications");
  const partners = useCount("partners", "partner_applications");
  const subscribers = useCount("subscribers", "newsletter_subscribers");
  const posts = useCount("posts", "blog_posts");
  const work = useCount("work", "work_projects");
  const testimonials = useCount("testimonials", "testimonials");
  const logos = useCount("logos", "client_logos");
  const roles = useCount("roles", "job_openings");

  const stats: { label: string; value: number | undefined; tab: string; icon: LucideIcon; hint: string }[] = [
    { label: "Enquiries", value: enquiries, tab: "enquiries", icon: Mail, hint: "Contact form messages" },
    { label: "Applications", value: applications, tab: "applications", icon: Briefcase, hint: "Job applications received" },
    { label: "Partner requests", value: partners, tab: "partners", icon: Handshake, hint: "Partnership enquiries" },
    { label: "Subscribers", value: subscribers, tab: "newsletter", icon: MailPlus, hint: "Newsletter sign-ups" },
    { label: "Insights", value: posts, tab: "posts", icon: FileText, hint: "Published articles" },
    { label: "Case studies", value: work, tab: "work", icon: FolderKanban, hint: "Projects in Our work" },
    { label: "Testimonials", value: testimonials, tab: "testimonials", icon: MessageSquareQuote, hint: "Client quotes" },
    { label: "Client logos", value: logos, tab: "logos", icon: Images, hint: "Logos on the site" },
    { label: "Open roles", value: roles, tab: "jobs", icon: Users, hint: "Careers page listings" },
  ];

  const recentEnquiries = useQuery(contactSubmissionsQuery);
  const recentApplications = useQuery(jobApplicationsQuery);

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => go(stat.tab)}
            className="group rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="size-5 text-primary" />
              <span className="text-3xl font-semibold tabular-nums">{stat.value ?? "…"}</span>
            </div>
            <p className="mt-3 font-semibold">{stat.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest enquiries</h2>
            <Button variant="ghost" size="sm" onClick={() => go("enquiries")}>View all</Button>
          </div>
          {recentEnquiries.data?.length ? (
            <ul className="divide-y divide-border">
              {recentEnquiries.data.slice(0, 5).map((row) => (
                <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold">{row.name} <span className="ml-2 text-xs font-normal text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span></p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{row.message}</p>
                </li>
              ))}
            </ul>
          ) : <Empty text="No enquiries yet." />}
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest applications</h2>
            <Button variant="ghost" size="sm" onClick={() => go("applications")}>View all</Button>
          </div>
          {recentApplications.data?.length ? (
            <ul className="divide-y divide-border">
              {recentApplications.data.slice(0, 5).map((row) => (
                <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold">{row.full_name} <span className="ml-2 text-xs font-normal text-muted-foreground">{row.role_title}</span></p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{row.email}</p>
                </li>
              ))}
            </ul>
          ) : <Empty text="No applications yet." />}
        </Card>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <article className="rounded-2xl border border-border bg-card p-6">{children}</article>;
}

function Empty({ text }: { text: string }) {
  return <p className="text-muted-foreground">{text}</p>;
}

const cellClass = "px-4 py-3 align-top text-sm [overflow-wrap:anywhere]";
const headClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function Enquiries() {
  const { data, isPending } = useQuery(contactSubmissionsQuery);
  if (isPending) return <Empty text="Loading enquiries…" />;
  if (!data?.length) return <Empty text="No enquiries yet." />;
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => downloadCsv("enquiries.csv", ["Date", "Name", "Email", "Phone", "Budget", "Source", "Message"], data.map((r) => [new Date(r.created_at).toLocaleString(), r.name, r.email, r.phone, r.budget, r.source, r.message]))}>Download Excel (CSV)</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] border-collapse">
          <thead><tr className="border-b border-border">{["Date", "Name", "Email", "Phone", "Budget", "Source", "Message"].map((h) => <th key={h} className={headClass}>{h}</th>)}</tr></thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className={`${cellClass} whitespace-nowrap text-muted-foreground`}>{new Date(row.created_at).toLocaleString()}</td>
                <td className={`${cellClass} font-semibold`}>{row.name}</td>
                <td className={cellClass}><a className="text-primary underline underline-offset-2" href={`mailto:${row.email}`}>{row.email}</a></td>
                <td className={`${cellClass} whitespace-nowrap`}>{row.phone || "—"}</td>
                <td className={`${cellClass} whitespace-nowrap`}>{row.budget || "—"}</td>
                <td className={cellClass}>{row.source || "—"}</td>
                <td className={`${cellClass} max-w-md whitespace-pre-line break-words leading-6`}>{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Applications() {
  const { data, isPending } = useQuery(jobApplicationsQuery);
  async function openResume(path: string) {
    const url = await resumeDownloadUrl(path);
    if (url) window.open(url, "_blank", "noopener");
  }
  if (isPending) return <Empty text="Loading applications…" />;
  if (!data?.length) return <Empty text="No applications yet." />;
  const byRole = new Map<string, typeof data>();
  for (const row of data) {
    const list = byRole.get(row.role_title) ?? [];
    list.push(row);
    byRole.set(row.role_title, list);
  }
  const exportRows = (rows: typeof data) => rows.map((r) => [new Date(r.created_at).toLocaleString(), r.full_name, r.email, r.phone, r.role_title, r.message, r.resume_path ? "CV attached" : "No CV"]);
  const headers = ["Date", "Name", "Email", "Phone", "Role", "Message", "CV"];
  return (
    <div className="grid gap-8">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => downloadCsv("all-applications.csv", headers, exportRows(data))}>Download all (Excel CSV)</Button>
      </div>
      {[...byRole.entries()].map(([role, rows]) => (
        <section key={role} className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{role} <span className="ml-2 text-sm font-normal text-muted-foreground">{rows.length} application{rows.length === 1 ? "" : "s"}</span></h2>
            <Button variant="outline" size="sm" onClick={() => downloadCsv(`applications-${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`, headers, exportRows(rows))}>Download this role</Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[860px] border-collapse">
              <thead><tr className="border-b border-border">{["Date", "Name", "Email", "Phone", "Message", "CV"].map((h) => <th key={h} className={headClass}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className={`${cellClass} whitespace-nowrap text-muted-foreground`}>{new Date(row.created_at).toLocaleString()}</td>
                    <td className={`${cellClass} font-semibold`}>{row.full_name}</td>
                    <td className={cellClass}><a className="text-primary underline underline-offset-2" href={`mailto:${row.email}`}>{row.email}</a></td>
                    <td className={`${cellClass} whitespace-nowrap`}>{row.phone || "—"}</td>
                    <td className={`${cellClass} max-w-sm whitespace-pre-line break-words leading-6`}>{row.message || "—"}</td>
                    <td className={cellClass}>{row.resume_path ? <Button variant="outline" size="sm" onClick={() => { if (row.resume_path) void openResume(row.resume_path); }}>Download CV</Button> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

const emptyPost = { slug: "", title: "", category: "Digital", summary: "", body: "", read_time: "5 min read", cover_image: "" };

function Posts() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(blogPostsQuery);
  const [draft, setDraft] = useState(emptyPost);
  const [editing, setEditing] = useState<string | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["blog_posts"] });

  const create = useMutation({
    mutationFn: async () => {
      const payload = postSchema.parse(draft);
      const { error } = editing ? await supabase.from("blog_posts").update(payload).eq("id", editing) : await supabase.from("blog_posts").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { setDraft(emptyPost); setEditing(null); void invalidate(); void queryClient.invalidateQueries({ queryKey: ["published_post"] }); },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const toggle = useMutation({
    mutationFn: async (post: BlogPost) => {
      const { error } = await supabase.from("blog_posts").update({ is_published: !post.is_published }).eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    create.mutate();
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border bg-card p-6" noValidate>
        <h2 className="text-xl font-semibold">{editing ? "Edit insight" : "Add an insight"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className={fieldClass} placeholder="Title" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} aria-label="Title" />
          <input className={fieldClass} placeholder="Category" required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} aria-label="Category" />
        </div>
        <textarea className={`${fieldClass} min-h-28 py-3`} placeholder="Summary" required value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} aria-label="Summary" />
        <input className={fieldClass} placeholder="Read time" value={draft.read_time} onChange={(e) => setDraft({ ...draft, read_time: e.target.value })} aria-label="Read time" />
        <ImageUploadField id="post-cover" label="Cover image (optional — a default is used if empty)" value={draft.cover_image} onChange={(v) => setDraft({ ...draft, cover_image: v })} />
        <RichTextEditor id="post-body" label="Full article" value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} placeholder="Write the full article — use the toolbar for headings, bold, highlights, links and images" />
        <div className="flex gap-3"><Button type="submit" disabled={create.isPending}>{editing ? "Save insight" : "Publish insight"}</Button>{editing && <Button variant="outline" type="button" onClick={() => { setEditing(null); setDraft(emptyPost); }}>Cancel</Button>}</div>
        {create.isError && <p className="text-sm text-primary">Could not save — please check the fields and try again.</p>}
      </form>
      {isPending ? <Empty text="Loading insights…" /> : (
        <div className="grid gap-4">
          {data?.map((post) => (
            <Card key={post.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <SiteImage src={post.cover_image} fallback={blogCover} alt="" className="hidden h-16 w-24 shrink-0 rounded-lg border border-border object-cover sm:block" />
                  <div className="min-w-0">
                  <p className="text-sm text-primary">{post.category}{post.is_featured ? " · Featured" : ""}</p>
                  <h3 className="mt-1 text-xl font-semibold">{post.title}</h3>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{post.summary}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(post.id); setDraft({ slug: post.slug, title: post.title, category: post.category, summary: post.summary, body: post.body ?? "", read_time: post.read_time ?? "", cover_image: post.cover_image ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggle.mutate(post)}>{post.is_published ? "Unpublish" : "Publish"}</Button>
                  <Button variant="outline" size="sm" onClick={() => remove.mutate(post.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyJob = { title: "", team: "Digital", location: "Ahmedabad, India", employment_type: "Full-time", description: "" };

function Jobs() {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(jobOpeningsQuery);
  const [draft, setDraft] = useState(emptyJob);
  const [editing, setEditing] = useState<string | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["job_openings"] });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = editing
        ? await supabase.from("job_openings").update(draft).eq("id", editing)
        : await supabase.from("job_openings").insert(draft);
      if (error) throw error;
    },
    onSuccess: () => { setDraft(emptyJob); setEditing(null); void invalidate(); },
  });
  const toggle = useMutation({
    mutationFn: async (job: JobOpening) => {
      const { error } = await supabase.from("job_openings").update({ is_open: !job.is_open }).eq("id", job.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_openings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    create.mutate();
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border bg-card p-6" noValidate>
        <h2 className="text-xl font-semibold">{editing ? "Edit role" : "Add an open role"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className={fieldClass} placeholder="Role title" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-label="Role title" />
          <input className={fieldClass} placeholder="Team" required value={draft.team} onChange={(e) => setDraft({ ...draft, team: e.target.value })} aria-label="Team" />
          <input className={fieldClass} placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} aria-label="Location" />
          <input className={fieldClass} placeholder="Employment type" value={draft.employment_type} onChange={(e) => setDraft({ ...draft, employment_type: e.target.value })} aria-label="Employment type" />
        </div>
        <textarea className={`${fieldClass} min-h-32 resize-y py-3`} placeholder="Role details — responsibilities, requirements, what we offer (shown in the details popup on the careers page)" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} aria-label="Role details" />
        <div className="flex gap-3">
          <Button type="submit" className="justify-self-start" disabled={create.isPending}>{editing ? "Save role" : "Add role"}</Button>
          {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setDraft(emptyJob); }}>Cancel</Button>}
        </div>
        {create.isError && <p className="text-sm text-primary">Could not save — please check the fields and try again.</p>}
      </form>
      {isPending ? <Empty text="Loading roles…" /> : (
        <div className="grid gap-4">
          {data?.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-primary">{job.team}</p>
                  <h3 className="mt-1 text-xl font-semibold">{job.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{job.location} · {job.employment_type} · {job.is_open ? "Open" : "Closed"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(job.id); setDraft({ title: job.title, team: job.team, location: job.location, employment_type: job.employment_type, description: job.description ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggle.mutate(job)}>{job.is_open ? "Close" : "Reopen"}</Button>
                  <Button variant="outline" size="sm" onClick={() => remove.mutate(job.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Partners() {
  const { data, isPending } = useQuery(partnerApplicationsQuery);
  if (isPending) return <Empty text="Loading partner requests…" />;
  if (!data?.length) return <Empty text="No partner requests yet." />;
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => downloadCsv("partner-requests.csv", ["Date", "Company", "Contact", "Email", "Phone", "Website", "Type", "Message"], data.map((r) => [new Date(r.created_at).toLocaleString(), r.company, r.contact_name, r.email, r.phone, r.website, r.partnership_type, r.message]))}>Download Excel (CSV)</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead><tr className="border-b border-border">{["Date", "Company", "Contact", "Email", "Phone", "Website", "Type", "Message"].map((h) => <th key={h} className={headClass}>{h}</th>)}</tr></thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className={`${cellClass} whitespace-nowrap text-muted-foreground`}>{new Date(row.created_at).toLocaleString()}</td>
                <td className={`${cellClass} font-semibold`}>{row.company}</td>
                <td className={cellClass}>{row.contact_name}</td>
                <td className={cellClass}><a className="text-primary underline underline-offset-2" href={`mailto:${row.email}`}>{row.email}</a></td>
                <td className={`${cellClass} whitespace-nowrap`}>{row.phone || "—"}</td>
                <td className={cellClass}>{row.website ? <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{row.website}</a> : "—"}</td>
                <td className={`${cellClass} whitespace-nowrap`}>{row.partnership_type || "—"}</td>
                <td className={`${cellClass} max-w-md whitespace-pre-line break-words leading-6`}>{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type FieldDef = { key: string; label: string; textarea?: boolean; required?: boolean; image?: boolean; rich?: boolean };
type Row = { id: string; is_published: boolean; sort_order: number } & Record<string, unknown>;
type ManagerConfig = {
  table: "testimonials" | "work_projects" | "client_logos";
  queryKey: string;
  query: typeof testimonialsQuery | typeof workProjectsQuery | typeof clientLogosQuery;
  title: string;
  fields: FieldDef[];
  heading: (row: Row) => string;
  sub: (row: Row) => string;
  thumb?: (row: Row) => string | null;
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const testimonialConfig: ManagerConfig = {
  table: "testimonials", queryKey: "testimonials", query: testimonialsQuery, title: "Add a testimonial",
  fields: [{ key: "name", label: "Client name", required: true }, { key: "role", label: "Role" }, { key: "company", label: "Company" }, { key: "image_url", label: "Client photo (optional — shown if added)", image: true }, { key: "quote", label: "Full testimonial", textarea: true, required: true }],
  heading: (r) => String(r["name"]), sub: (r) => String(r["quote"]),
  thumb: (r) => (r["image_url"] ? String(r["image_url"]) : null),
};
const workConfig: ManagerConfig = {
  table: "work_projects", queryKey: "work_projects", query: workProjectsQuery, title: "Add a project",
  fields: [{ key: "title", label: "Project title", required: true }, { key: "client", label: "Client", required: true }, { key: "category", label: "Category (Digital / Marcomm / Technology)", required: true }, { key: "result", label: "Result line" }, { key: "image_url", label: "Project image", image: true }, { key: "summary", label: "Summary", textarea: true, required: true }, { key: "body", label: "Full case study (optional — creates the “Read full case study” page)", rich: true }],
  heading: (r) => String(r["title"]), sub: (r) => `${String(r["client"])} · ${String(r["category"])}`,
  thumb: (r) => (r["image_url"] ? String(r["image_url"]) : null),
};
const logoConfig: ManagerConfig = {
  table: "client_logos", queryKey: "client_logos", query: clientLogosQuery, title: "Add a client logo",
  fields: [{ key: "name", label: "Client name", required: true }, { key: "logo_url", label: "Logo image (optional — name shows if empty)", image: true }],
  heading: (r) => String(r["name"]), sub: (r) => (r["logo_url"] ? "Image logo" : "Text logo"),
  thumb: (r) => (r["logo_url"] ? String(r["logo_url"]) : null),
};

function ContentManager({ config }: { config: ManagerConfig }) {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(config.query as typeof testimonialsQuery);
  const blank = Object.fromEntries(config.fields.map((f) => [f.key, ""]));
  const [draft, setDraft] = useState<Record<string, string>>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [config.queryKey] });
  const rows = (data ?? []) as unknown as Row[];

  const save = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));
      if (config.table === "work_projects" && !payload["slug"]) payload["slug"] = slugify(String(payload["title"] ?? ""));
      const table = supabase.from(config.table) as unknown as {
        insert: (v: object) => Promise<{ error: Error | null }>;
        update: (v: object) => { eq: (c: string, v: string) => Promise<{ error: Error | null }> };
      };
      const { error } = editing
        ? await table.update(payload).eq("id", editing)
        : await table.insert({ ...payload, sort_order: rows.length + 1 });
      if (error) throw error;
    },
    onSuccess: () => { setDraft(blank); setEditing(null); void invalidate(); },
  });
  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: object }) => {
      const table = supabase.from(config.table) as unknown as { update: (v: object) => { eq: (c: string, v: string) => Promise<{ error: Error | null }> } };
      const { error } = await table.update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    save.mutate();
  }
  function edit(row: Row) {
    setEditing(row.id);
    setDraft(Object.fromEntries(config.fields.map((f) => [f.key, row[f.key] == null ? "" : String(row[f.key])])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border bg-card p-6" noValidate>
        <h2 className="text-xl font-semibold">{editing ? "Edit entry" : config.title}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((f) => (
            f.image
              ? <ImageUploadField key={f.key} id={`${config.table}-${f.key}`} label={f.label} value={draft[f.key] ?? ""} onChange={(v) => setDraft({ ...draft, [f.key]: v })} />
              : f.rich
                ? <RichTextEditor key={f.key} id={`${config.table}-${f.key}`} label={f.label} value={draft[f.key] ?? ""} onChange={(v) => setDraft({ ...draft, [f.key]: v })} />
                : <div key={f.key} className={f.textarea ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`${config.table}-${f.key}`} className="text-sm font-semibold">{f.label}</label>
                  {f.textarea
                    ? <textarea id={`${config.table}-${f.key}`} className={`${fieldClass} min-h-28 resize-y py-3`} required={f.required} value={draft[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
                    : <input id={`${config.table}-${f.key}`} className={fieldClass} required={f.required} value={draft[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />}
                </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>{editing ? "Save changes" : "Add"}</Button>
          {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setDraft(blank); }}>Cancel</Button>}
        </div>
        {save.isError && <p className="text-sm text-primary">Could not save — please check the fields and try again.</p>}
      </form>
      {isPending ? <Empty text="Loading…" /> : !rows.length ? <Empty text="Nothing added yet." /> : (
        <div className="grid gap-4">
          {rows.map((row, i) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  {config.thumb?.(row) ? <SiteImage src={config.thumb(row)} alt="" className="hidden h-16 w-24 shrink-0 rounded-lg border border-border object-cover sm:block" /> : null}
                  <div className="min-w-0">
                  <p className="text-sm text-primary">#{i + 1} · {row.is_published ? "Visible" : "Hidden"}</p>
                  <h3 className="mt-1 text-xl font-semibold">{config.heading(row)}</h3>
                  <p className="mt-2 line-clamp-2 max-w-2xl text-muted-foreground">{config.sub(row)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled={i === 0} onClick={() => { const prev = rows[i - 1]; if (!prev) return; patch.mutate({ id: row.id, values: { sort_order: prev.sort_order } }); patch.mutate({ id: prev.id, values: { sort_order: row.sort_order } }); }} aria-label="Move up">↑</Button>
                  <Button variant="outline" size="sm" disabled={i === rows.length - 1} onClick={() => { const next = rows[i + 1]; if (!next) return; patch.mutate({ id: row.id, values: { sort_order: next.sort_order } }); patch.mutate({ id: next.id, values: { sort_order: row.sort_order } }); }} aria-label="Move down">↓</Button>
                  <Button variant="outline" size="sm" onClick={() => edit(row)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => patch.mutate({ id: row.id, values: { is_published: !row.is_published } })}>{row.is_published ? "Hide" : "Show"}</Button>
                  <Button variant="outline" size="sm" onClick={() => { if (window.confirm("Delete this entry?")) remove.mutate(row.id); }}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
