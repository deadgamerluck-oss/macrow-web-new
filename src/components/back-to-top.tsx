import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Floating "back to top" arrow that appears after the visitor scrolls down. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const goUp = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <button
      type="button"
      onClick={goUp}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-5 left-5 z-[57] grid size-12 place-items-center rounded-full border border-border bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
