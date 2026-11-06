import { Fragment, type ReactNode } from "react";
import { SiteImage } from "@/lib/site-images";

/**
 * Safe rich-text renderer for admin-authored content (insights, case studies).
 * Supported markers (no raw HTML is ever rendered):
 *   ## Heading            — section heading
 *   ### Heading           — sub heading
 *   **bold**              — strong text
 *   *italic*              — emphasis
 *   ==highlight==         — highlighted text
 *   [label](https://…)    — link
 *   ![alt](https://… or storage:…) — image
 *   lines starting with "- " — bullet list
 * Everything else renders as paragraphs.
 */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|==[^=]+==|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part !== "")
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={key} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("==") && part.endsWith("==") && part.length > 4) {
        return <mark key={key} className="rounded bg-primary/20 px-1 py-0.5 text-foreground">{part.slice(2, -2)}</mark>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const href = link[2]!;
        const external = href.startsWith("http");
        return (
          <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-medium text-primary underline underline-offset-4">
            {link[1]}
          </a>
        );
      }
      return <Fragment key={key}>{part}</Fragment>;
    });
}

export function RichText({ text }: { text?: string | null }) {
  const blocks = (text ?? "").split(/\n\s*\n/).filter(Boolean);
  if (!blocks.length) return null;
  return (
    <div>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        if (block.startsWith("### ")) {
          return <h3 key={key} className="mb-3 mt-8 text-xl font-semibold">{renderInline(block.slice(4), key)}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={key} className="mb-4 mt-10 text-2xl font-semibold">{renderInline(block.slice(3), key)}</h2>;
        }
        const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image) {
          return (
            <figure key={key} className="my-8">
              <SiteImage src={image[2]!} alt={image[1] ?? ""} className="w-full rounded-2xl border border-border object-cover" />
              {image[1] && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{image[1]}</figcaption>}
            </figure>
          );
        }
        const lines = block.split("\n").filter(Boolean);
        if (lines.length > 1 && lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={key} className="mb-6 list-disc space-y-2 pl-6 text-lg leading-8">
              {lines.map((line, j) => <li key={j}>{renderInline(line.slice(2), `${key}-${j}`)}</li>)}
            </ul>
          );
        }
        return <p key={key} className="mb-6 whitespace-pre-line break-words text-lg leading-8">{renderInline(block, key)}</p>;
      })}
    </div>
  );
}
