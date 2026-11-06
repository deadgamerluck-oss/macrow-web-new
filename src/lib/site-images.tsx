import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-images";
const PREFIX = "storage:";

export function isStoredImage(value?: string | null): boolean {
  return !!value && value.startsWith(PREFIX);
}

/** Upload an image to the site-images bucket; returns the stored value ("storage:<path>"). */
export async function uploadSiteImage(file: File): Promise<string> {
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  return PREFIX + path;
}

function useImageUrl(value?: string | null): string | null {
  const stored = isStoredImage(value);
  const path = stored && value ? value.slice(PREFIX.length) : "";
  const { data } = useQuery({
    queryKey: ["site-image", path],
    enabled: stored,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 7 * 24 * 3600);
      return data?.signedUrl ?? null;
    },
  });
  if (!value) return null;
  if (stored) return data ?? null;
  // Only full links are usable as-is; anything else (e.g. legacy image keys) falls through to the fallback resolver.
  return /^https?:\/\//.test(value) ? value : null;
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** Bundled/known-image resolver for legacy values (e.g. blog cover keys). */
  fallback?: (value?: string | null) => string;
};

/** Renders an image stored as an https link, a storage: path, or via a fallback resolver. */
export function SiteImage({ src, fallback, alt = "", ...rest }: Props) {
  const resolved = useImageUrl(src);
  const finalSrc = resolved ?? (fallback ? fallback(src) : null);
  if (!finalSrc) return null;
  return <img src={finalSrc} alt={alt} loading="lazy" decoding="async" {...rest} />;
}
