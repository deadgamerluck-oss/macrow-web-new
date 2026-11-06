import { describe, expect, it } from "vitest";
import { renderSitemap } from "@/lib/sitemap";
import { heroVideoVariant, shouldLoadHeroVideo } from "@/lib/media-policy";

describe("Published search discovery", () => {
  it("includes public articles and case studies at the public origin", () => {
    const xml = renderSitemap([{ path: "/blog/ai-workflows" }, { path: "/work/client-launch" }]);
    expect(xml).toContain("https://macrowdigital.com/blog/ai-workflows");
    expect(xml).toContain("https://macrowdigital.com/work/client-launch");
    expect(xml).not.toContain("id-preview");
  });
  it("does not invent a modification date for static pages", () => {
    expect(renderSitemap([{ path: "/services" }])).not.toContain("<lastmod>");
  });
  it("uses the article's actual modification date", () => {
    expect(renderSitemap([{ path: "/blog/ai-workflows", updatedAt: "2026-10-18T07:59:00Z" }])).toContain("<lastmod>2026-10-18T07:59:00.000Z</lastmod>");
  });
});

describe("Fast-loading hero media", () => {
  it("avoids video entirely on phone screens", () => {
    expect(heroVideoVariant({ width: 430, reducedMotion: false, saveData: false })).toBe(null);
  });
  it("serves the lighter video on tablet screens", () => {
    expect(heroVideoVariant({ width: 951, reducedMotion: false, saveData: false })).toBe("light");
  });
  it("respects reduced-motion preferences", () => {
    expect(shouldLoadHeroVideo({ width: 1280, reducedMotion: true, saveData: false })).toBe(false);
  });
  it("avoids video for data-saving and slow connections", () => {
    expect(shouldLoadHeroVideo({ width: 1280, reducedMotion: false, saveData: true })).toBe(false);
    expect(shouldLoadHeroVideo({ width: 1280, reducedMotion: false, saveData: false, effectiveType: "3g" })).toBe(false);
  });
  it("serves the full video on suitable desktop connections", () => {
    expect(heroVideoVariant({ width: 1280, reducedMotion: false, saveData: false, effectiveType: "4g" })).toBe("full");
  });
});
