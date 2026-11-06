import ai from "@/assets/blog-ai.webp";
import marketing from "@/assets/blog-marketing.webp";
import brand from "@/assets/blog-brand.webp";
import search from "@/assets/blog-search.webp";
import digitalStrategy from "@/assets/digital-strategy.webp";
import creativeStudio from "@/assets/creative-studio.webp";
import productDesign from "@/assets/product-design.webp";
import paidAds from "@/assets/paid-ads-editorial.jpg.asset.json";
import studioTeam from "@/assets/studio-team.jpg.asset.json";
import city from "@/assets/city-optimized.webp.asset.json";
import calculator from "@/assets/studio-calculator.jpg.asset.json";

const map: Record<string, string> = {
  ai, marketing, brand, search, "digital-strategy": digitalStrategy, "creative-studio": creativeStudio,
  "product-design": productDesign, "paid-ads": paidAds.url, "studio-team": studioTeam.url,
  "city-interchange": city.url, "studio-calculator": calculator.url,
};

/** Resolves a stored cover value: a known image key or a full https link. */
export function blogCover(value?: string | null): string {
  if (value && /^https:\/\//.test(value)) return value;
  return map[value ?? ""] ?? paidAds.url;
}
