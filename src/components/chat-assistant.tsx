import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { chatbotSettingsQuery } from "@/lib/chatbot";
import assistantMark from "@/assets/macrow-assistant.webp";

const ChatPanel = lazy(() => import("./chat-panel"));

/** Floating bottom-right launcher. The chat itself loads only when a visitor opens it, keeping pages fast. */
export function ChatAssistant({ bannerOpen }: { bannerOpen: boolean }) {
  const { data: settings } = useQuery(chatbotSettingsQuery);
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [nudge, setNudge] = useState(false);

  // Sit above the cookie banner while it is showing (the banner can appear a moment after this mounts).
  useEffect(() => {
    if (!bannerOpen) {
      setOffset(0);
      return;
    }
    let resize: ResizeObserver | undefined;
    const attach = () => {
      const banner = document.querySelector<HTMLElement>(".cookie-banner");
      if (!banner) return false;
      const update = () => setOffset(banner.isConnected ? banner.offsetHeight + 12 : 0);
      update();
      resize = new ResizeObserver(update);
      resize.observe(banner);
      return true;
    };
    const mutations = new MutationObserver(() => {
      if (attach()) mutations.disconnect();
    });
    if (!attach()) mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      resize?.disconnect();
    };
  }, [bannerOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => setNudge(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!settings?.enabled) return null;
  return (
    <div
      className="chat-assistant"
      style={{ "--chat-offset": `${offset}px` } as React.CSSProperties}
    >
      {open && (
        <Suspense fallback={null}>
          <ChatPanel settings={settings} onClose={() => setOpen(false)} />
        </Suspense>
      )}
      {nudge && !open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setNudge(false);
          }}
          className="chat-nudge fixed right-5 z-[58] hidden max-w-60 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground shadow-xl sm:block"
          style={{ bottom: "calc(var(--chat-offset) + 6rem)" }}
        >
          <span className="font-semibold">Got a growth question?</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Ask {settings.assistant_name} — answers in seconds.
          </span>
        </button>
      )}
      <button
        type="button"
        aria-label={open ? "Close chat" : `Chat with ${settings.assistant_name}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setNudge(false);
        }}
        className={`chat-launcher fixed right-5 z-[58] grid size-16 place-items-center rounded-full border border-border bg-card shadow-2xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${open ? "max-sm:hidden" : ""}`}
        style={{ bottom: "calc(var(--chat-offset) + 1.25rem)" }}
      >
        {open ? (
          <X className="size-6 text-foreground" />
        ) : (
          <img src={assistantMark} alt="" width={256} height={256} className="size-full rounded-full object-cover" />
        )}
        {!open && <span className="chat-launcher-pulse" aria-hidden="true" />}
      </button>
    </div>
  );
}
