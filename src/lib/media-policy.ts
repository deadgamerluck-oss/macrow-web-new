export type HeroVideoVariant = "full" | "light" | null;

type MediaOptions = { width: number; reducedMotion: boolean; saveData: boolean; effectiveType?: string | undefined };

/** Which hero video (if any) a visitor should download: full on desktop, a lighter cut on tablets, none on phones or constrained connections. */
export function heroVideoVariant(options: MediaOptions): HeroVideoVariant {
  if (options.reducedMotion || options.saveData || ["slow-2g", "2g", "3g"].includes(options.effectiveType ?? "")) return null;
  if (options.width >= 1024) return "full";
  if (options.width >= 768) return "light";
  return null;
}

export function shouldLoadHeroVideo(options: MediaOptions): boolean {
  return heroVideoVariant(options) !== null;
}
