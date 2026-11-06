import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { CHAT_ID_KEY, type ChatbotSettings } from "@/lib/chatbot";
import { loadChatConversation } from "@/lib/chatbot.functions";
import assistantMark from "@/assets/macrow-assistant.webp";

const SUGGESTIONS = [
  "What services do you offer?",
  "How can I get more leads?",
  "I need a new website",
  "Can AI help my business?",
];

function readChatId() {
  try {
    const saved = localStorage.getItem(CHAT_ID_KEY);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(CHAT_ID_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export default function ChatPanel({
  settings,
  onClose,
}: {
  settings: ChatbotSettings;
  onClose: () => void;
}) {
  const loadHistory = useServerFn(loadChatConversation);
  const [chatId, setChatId] = useState<string | null>(null);
  const [initial, setInitial] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    setChatId(readChatId());
  }, []);
  useEffect(() => {
    if (!chatId) return;
    let active = true;
    setInitial(null);
    loadHistory({ data: { id: chatId } })
      .then((r) => {
        if (active) setInitial(JSON.parse(r.messagesJson) as UIMessage[]);
      })
      .catch(() => {
        if (active) setInitial([]);
      });
    return () => {
      active = false;
    };
  }, [chatId, loadHistory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function startOver() {
    const fresh = crypto.randomUUID();
    try {
      localStorage.setItem(CHAT_ID_KEY, fresh);
    } catch {
      /* Private browsing: keep the in-memory id. */
    }
    setChatId(fresh);
  }

  return (
    <section
      role="dialog"
      aria-label={`Chat with ${settings.assistant_name}`}
      className="chat-panel fixed inset-x-2 bottom-2 top-16 z-[70] flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:top-auto sm:bottom-[calc(var(--chat-offset)+6rem)] sm:h-[min(620px,calc(100svh-var(--chat-offset)-8rem))] sm:w-[400px]"
    >
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <img
          src={assistantMark}
          alt=""
          width={256}
          height={256}
          className="size-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{settings.assistant_name}</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            Online · Macrow Digital
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={startOver}
          aria-label="Start over"
          title="Start over"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close chat"
          title="Close"
        >
          <X className="size-4" />
        </Button>
      </header>
      {chatId && initial ? (
        <ChatWindow
          key={chatId}
          chatId={chatId}
          initial={initial}
          settings={settings}
          onNavigate={() => {
            if (window.innerWidth < 640) onClose();
          }}
        />
      ) : (
        <div className="grid flex-1 place-items-center">
          <Shimmer>Opening chat…</Shimmer>
        </div>
      )}
      <p className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground">
        AI answers can be imperfect · details you share go to our team
      </p>
    </section>
  );
}

function ChatWindow({
  chatId,
  initial,
  settings,
  onNavigate,
}: {
  chatId: string;
  initial: UIMessage[];
  settings: ChatbotSettings;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: { id, message: messages.at(-1), path: window.location.pathname },
        }),
      }),
    [],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initial,
    transport,
    onError: (e) => {
      let text = e.message;
      try {
        const parsed = JSON.parse(e.message) as { error?: string };
        if (parsed.error) text = parsed.error;
      } catch {
        /* Plain text error. */
      }
      setError(text || "Something went wrong. Please try again.");
    },
  });
  const busy = status === "submitted" || status === "streaming";
  const last = messages.at(-1);
  const waiting =
    status === "submitted" ||
    (status === "streaming" &&
      last?.role === "assistant" &&
      !last.parts.some((p) => p.type === "text" && p.text));

  const focusInput = () => rootRef.current?.querySelector("textarea")?.focus();
  useEffect(() => {
    focusInput();
  }, []);
  useEffect(() => {
    if (status === "ready" || status === "error") focusInput();
  }, [status]);

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setError("");
    void sendMessage({ text: value.slice(0, 2000) });
  }

  // Keep visitors inside the site (and the chat open on desktop) when they follow a link the assistant shares.
  function handleLink(e: MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!href) return;
    let url: URL;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    e.stopPropagation();
    void navigate({ to: url.pathname + url.search + url.hash });
    onNavigate();
  }

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-5 p-4" onClickCapture={handleLink}>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>{settings.greeting}</MessageResponse>
            </MessageContent>
          </Message>
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-card-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                {message.parts.map((part, i) => {
                  const key = `${message.id}-${i}`;
                  if (part.type === "text") {
                    return message.role === "user" ? (
                      <p key={key} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : (
                      <MessageResponse
                        key={key}
                        className="chat-markdown"
                        linkSafety={{ enabled: false }}
                      >
                        {part.text}
                      </MessageResponse>
                    );
                  }
                  if (part.type === "reasoning" && part.text) {
                    const streamingThis =
                      status === "streaming" &&
                      message.id === last?.id &&
                      i === message.parts.length - 1;
                    return (
                      <Reasoning key={key} isStreaming={streamingThis} defaultOpen={false}>
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  }
                  if (part.type === "tool-save_lead") {
                    const output =
                      part.state === "output-available"
                        ? (part.output as { saved?: boolean } | undefined)
                        : undefined;
                    const input = part.input as
                      { name?: string; email?: string; phone?: string } | undefined;
                    return (
                      <Tool key={key} defaultOpen={false} className="mb-0 border-border bg-card">
                        <ToolHeader
                          type={part.type}
                          state={part.state}
                          title={
                            output?.saved ? "Details shared with our team" : "Sharing your details"
                          }
                        />
                        <ToolContent className="p-3 pt-0">
                          {input && (
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                              {input.name && (
                                <>
                                  <dt className="text-muted-foreground">Name</dt>
                                  <dd>{input.name}</dd>
                                </>
                              )}
                              {input.email && (
                                <>
                                  <dt className="text-muted-foreground">Email</dt>
                                  <dd className="break-all">{input.email}</dd>
                                </>
                              )}
                              {input.phone && (
                                <>
                                  <dt className="text-muted-foreground">Mobile</dt>
                                  <dd>{input.phone}</dd>
                                </>
                              )}
                            </dl>
                          )}
                          {output?.saved && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
                              <CheckCircle2 className="size-3.5" />
                              Saved securely
                            </p>
                          )}
                          {part.state === "output-error" && (
                            <p className="mt-2 text-xs text-destructive">
                              Couldn’t save these details.
                            </p>
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {waiting && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-3 pt-0">
        <PromptInput onSubmit={(m) => send(m.text)} className="bg-card">
          <PromptInputTextarea
            placeholder="Ask anything about growing your business…"
            maxLength={2000}
            className="min-h-12 text-sm"
            aria-label="Your message"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
