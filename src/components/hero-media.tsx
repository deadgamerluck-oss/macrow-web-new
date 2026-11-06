import { useEffect, useRef, useState } from "react";
import { heroVideoVariant, type HeroVideoVariant } from "@/lib/media-policy";
import heroVideo from "@/assets/macrow-agency-hero.mp4.asset.json";
import heroVideoLight from "@/assets/macrow-agency-hero-light.mp4.asset.json";

export function HeroVideo({ poster }: { poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [variant, setVariant] = useState<HeroVideoVariant>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const update = () => setVariant(heroVideoVariant({ width: innerWidth, reducedMotion: motion.matches, saveData: connection?.saveData ?? false, effectiveType: connection?.effectiveType }));
    const timer = window.setTimeout(update, 1200);
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); motion.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video || !variant) return;
    let inView = true;
    const update = () => { if (inView && !document.hidden) void video.play().catch(() => undefined); else video.pause(); };
    const observer = new IntersectionObserver(entries => { inView = entries.some(entry => entry.isIntersecting); update(); });
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); video.pause(); };
  }, [variant]);
  if (!variant) return null;
  return (
    <video
      key={variant}
      ref={ref}
      src={variant === "full" ? heroVideo.url : heroVideoLight.url}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      data-playing={playing}
      className="hero-video absolute inset-0 size-full object-cover"
    />
  );
}
