import { createFileRoute } from "@tanstack/react-router";
import { metadata, CONTACT } from "@/lib/site-data";
import { Mail, Wrench, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceSettingsQuery } from "@/lib/maintenance";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  head: () =>
    metadata(
      "Under Scheduled Maintenance — Macrow Digital",
      "Macrow Digital is currently undergoing scheduled maintenance. We will be back online shortly.",
      "/maintenance",
    ),
  component: MaintenancePage,
});

export function MaintenancePage() {
  const { data: settings } = useQuery(maintenanceSettingsQuery);

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center px-5 py-24 text-center">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="h-64 w-64 rounded-full bg-gold/10 blur-2xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/10">
          <Wrench className="size-8 animate-pulse" />
        </div>

        <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <ShieldAlert className="size-3.5" /> Maintenance Mode Active
        </p>

        <h1 className="mt-6 text-3xl font-medium tracking-tight sm:text-5xl">
          {settings?.title || "We are undergoing scheduled maintenance"}
        </h1>

        <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
          {settings?.message ||
            "Macrow Digital is currently upgrading our digital systems to serve you better. We will be back online shortly. For urgent inquiries, email our team."}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <a href={`mailto:${CONTACT.email}`}>
              <Mail className="size-4" /> Email us at {CONTACT.email}
            </a>
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          Macrow Digital · Jaipur · Ahmedabad · Patna · Serving globally
        </p>
      </div>
    </div>
  );
}
