import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/site";
import { SiteImage, uploadSiteImage } from "@/lib/site-images";

/**
 * Admin image field: upload a file directly (stored securely) or paste an https link.
 * Value is the stored string ("storage:<path>" or an https URL).
 */
export function ImageUploadField({ id, label, value, onChange, required }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("Image must be 8MB or smaller."); return; }
    setBusy(true);
    setError("");
    try {
      onChange(await uploadSiteImage(file));
    } catch (err) {
      console.error("image upload failed", err);
      const message =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Upload failed — please try again.";
      setError(message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {value ? (
          <SiteImage src={value} alt="Selected image preview" className="h-16 w-24 rounded-lg border border-border object-cover" />
        ) : (
          <span className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">No image</span>
        )}
        <input ref={fileRef} id={id} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </Button>
        {value && !required && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>Remove</Button>}
      </div>
      <input
        className={`${fieldClass} mt-2`}
        type="url"
        placeholder="…or paste an https:// image link"
        value={value.startsWith("storage:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label} link`}
      />
      {error && <p role="alert" className="mt-1 text-sm text-primary">{error}</p>}
    </div>
  );
}
