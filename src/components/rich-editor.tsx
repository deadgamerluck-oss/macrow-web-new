import { useRef, useState } from "react";
import { Bold, Heading2, Highlighter, Image as ImageIcon, Italic, Link2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/site";
import { uploadSiteImage } from "@/lib/site-images";

/**
 * Toolbar editor for admin-authored long text (articles, case studies).
 * Stores safe marker text (see src/lib/rich-text.tsx) — never raw HTML.
 */
export function RichTextEditor({ id, label, value, onChange, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function wrapSelection(before: string, after = before, fallback = "text") {
    const area = areaRef.current;
    if (!area) return;
    const start = area.selectionStart ?? value.length;
    const end = area.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallback;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertBlock(snippet: string) {
    const area = areaRef.current;
    const at = area?.selectionStart ?? value.length;
    const next = value.slice(0, at) + (at > 0 && !value.slice(0, at).endsWith("\n\n") ? "\n\n" : "") + snippet + value.slice(at);
    onChange(next);
    area?.focus();
  }

  function addLink() {
    const area = areaRef.current;
    const selected = area ? value.slice(area.selectionStart, area.selectionEnd) : "";
    const url = window.prompt("Link address (https://…)", "https://");
    if (!url || url === "https://") return;
    wrapSelection(`[${selected || "link text"}](${url})`, "", "");
  }

  async function addImage(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("Image must be 8MB or smaller."); return; }
    setBusy(true);
    setError("");
    try {
      const stored = await uploadSiteImage(file);
      insertBlock(`![image](${stored})`);
    } catch {
      setError("Upload failed — please try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const tools = [
    { icon: Heading2, label: "Heading", onClick: () => insertBlock("## Section heading") },
    { icon: Bold, label: "Bold", onClick: () => wrapSelection("**") },
    { icon: Italic, label: "Italic", onClick: () => wrapSelection("*") },
    { icon: Highlighter, label: "Highlight", onClick: () => wrapSelection("==") },
    { icon: Link2, label: "Add link", onClick: addLink },
    { icon: List, label: "Bullet list", onClick: () => insertBlock("- First point\n- Second point\n- Third point") },
  ];

  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="mt-1 rounded-2xl border border-border bg-background">
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-2" role="toolbar" aria-label="Text formatting">
          {tools.map((tool) => (
            <Button key={tool.label} type="button" variant="ghost" size="sm" onClick={tool.onClick} title={tool.label} aria-label={tool.label}>
              <tool.icon className="size-4" />
              <span className="ml-1.5 hidden text-xs sm:inline">{tool.label}</span>
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => fileRef.current?.click()} title="Insert image" aria-label="Insert image">
            <ImageIcon className="size-4" />
            <span className="ml-1.5 hidden text-xs sm:inline">{busy ? "Uploading…" : "Image"}</span>
          </Button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void addImage(e.target.files?.[0])} />
        </div>
        <textarea
          ref={areaRef}
          id={id}
          className={`${fieldClass} h-80 resize-y rounded-none border-0 bg-transparent focus-visible:ring-0`}
          maxLength={100000}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Select text and use the toolbar to make it bold, highlighted or a link. Images are uploaded straight into the article.</p>
      {error && <p role="alert" className="mt-1 text-sm text-primary">{error}</p>}
    </div>
  );
}
