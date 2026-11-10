import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fieldClass } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  maintenanceSettingsQuery,
  defaultMaintenanceSettings,
  type MaintenanceSettings,
} from "@/lib/maintenance";
import { saveMaintenanceSettings } from "@/lib/maintenance.functions";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export function MaintenanceManager() {
  const queryClient = useQueryClient();
  const save = useServerFn(saveMaintenanceSettings);
  const { data, isPending } = useQuery(maintenanceSettingsQuery);
  const [draft, setDraft] = useState<MaintenanceSettings>(defaultMaintenanceSettings);
  const [notice, setNotice] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  useEffect(() => {
    if (data) {
      setDraft(data);
    }
  }, [data]);

  const persist = useMutation({
    mutationFn: (value: MaintenanceSettings) => save({ data: value }),
    onSuccess: async () => {
      setNotice("Maintenance mode settings updated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["maintenance-settings"] });
    },
    onError: (err) => {
      setNotice(`Error: ${err.message}`);
    },
  });

  function handleToggle(checked: boolean) {
    if (checked) {
      // Opening warning modal before turning maintenance mode ON
      setPendingState(true);
      setShowConfirmModal(true);
    } else {
      // Disabling maintenance mode
      const updated = { ...draft, enabled: false };
      setDraft(updated);
      persist.mutate(updated);
    }
  }

  function confirmEnable() {
    setShowConfirmModal(false);
    const updated = { ...draft, enabled: true };
    setDraft(updated);
    persist.mutate(updated);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    if (e.currentTarget.reportValidity()) {
      persist.mutate(draft);
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Maintenance Mode</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Take the public website offline for upgrades or maintenance while preserving full access to the admin dashboard and team sign-in.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Toggle Status Card */}
        <div
          className={`flex flex-col gap-4 rounded-3xl border p-6 transition sm:flex-row sm:items-center sm:justify-between ${
            draft.enabled
              ? "border-destructive/40 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
                draft.enabled
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-success/30 bg-success/10 text-success"
              }`}
            >
              {draft.enabled ? (
                <ShieldAlert className="size-6" />
              ) : (
                <CheckCircle2 className="size-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Status: {draft.enabled ? "Maintenance Mode Active" : "Website Live & Accessible"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {draft.enabled
                  ? "All visitors are currently redirected to the maintenance page. The admin dashboard remains accessible."
                  : "The website is operating normally for all visitors."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {draft.enabled ? "Online" : "Offline"}
            </span>
            <Switch
              checked={draft.enabled}
              onCheckedChange={handleToggle}
              disabled={isPending || persist.isPending}
              aria-label="Toggle maintenance mode"
            />
          </div>
        </div>

        {/* Content Customization Form */}
        <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-border bg-card p-7">
          <h3 className="text-base font-semibold">Maintenance Page Message</h3>
          <p className="text-xs text-muted-foreground">
            Customise the headline and information displayed on the maintenance screen.
          </p>

          <div>
            <label htmlFor="maint-title" className="text-sm font-semibold">
              Headline
            </label>
            <input
              id="maint-title"
              className={fieldClass}
              value={draft.title}
              maxLength={160}
              required
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="maint-msg" className="text-sm font-semibold">
              Notice Details
            </label>
            <textarea
              id="maint-msg"
              className={`${fieldClass} min-h-28`}
              value={draft.message}
              maxLength={1000}
              required
              onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
            />
          </div>

          {notice && (
            <p
              role="alert"
              className={`rounded-xl border p-4 text-sm ${
                notice.startsWith("Error")
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-success/30 bg-success/10 text-success"
              }`}
            >
              {notice}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" disabled={persist.isPending}>
              {persist.isPending ? "Saving changes…" : "Save message changes"}
            </Button>
            <a
              href="/maintenance"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary underline underline-offset-4"
            >
              Preview maintenance page
            </a>
          </div>
        </form>
      </div>

      {/* Confirmation Warning Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle>Enable Maintenance Mode?</DialogTitle>
            <DialogDescription className="text-left text-sm leading-6">
              When maintenance mode is activated, <strong>all visitors</strong> to any public page
              will be immediately redirected to the maintenance page.
              <br />
              <br />
              The admin panel (`/admin`), authentication (`/auth`), and team tools will remain completely functional.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setPendingState(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmEnable}
              disabled={persist.isPending}
            >
              {persist.isPending ? "Activating…" : "Yes, activate maintenance mode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

