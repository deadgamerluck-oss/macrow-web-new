import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fieldClass } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { chatbotSettingsQuery, type ChatbotSettings } from "@/lib/chatbot";
import { saveChatbotSettings } from "@/lib/chatbot.functions";
import assistantMark from "@/assets/macrow-assistant.webp";

export function ChatbotManager() {
  const queryClient = useQueryClient();
  const save = useServerFn(saveChatbotSettings);
  const { data, isPending, error } = useQuery(chatbotSettingsQuery);
  const [draft, setDraft] = useState<ChatbotSettings | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  const stats = useQuery({
    queryKey: ["chatbot-stats"],
    queryFn: async () => {
      const [chats, leads] = await Promise.all([
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
        supabase
          .from("contact_submissions")
          .select("id", { count: "exact", head: true })
          .eq("source", "AI chat assistant"),
      ]);
      if (chats.error) throw chats.error;
      if (leads.error) throw leads.error;
      return { chats: chats.count ?? 0, leads: leads.count ?? 0 };
    },
  });

  const persist = useMutation({
    mutationFn: (value: ChatbotSettings) => save({ data: value }),
    onSuccess: async () => {
      setNotice("Assistant settings saved. Visitors see changes within a minute.");
      await queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
    },
  });

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");
    if (draft && e.currentTarget.reportValidity()) persist.mutate(draft);
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <img
          src={assistantMark}
          alt=""
          width={128}
          height={128}
          className="size-12 rounded-full border border-border bg-card p-2"
        />
        <div>
          <h2 className="text-2xl font-semibold">AI assistant</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The chat bubble in the bottom-right corner of every public page. Leads it collects
            appear in Enquiries as “AI chat assistant”.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Conversations</p>
          <p className="mt-1 text-3xl font-semibold">{stats.data?.chats ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Leads from chat</p>
          <p className="mt-1 text-3xl font-semibold">{stats.data?.leads ?? "—"}</p>
        </div>
      </div>
      {isPending && <p className="text-muted-foreground">Loading settings…</p>}
      {(error || persist.isError) && (
        <p role="alert" className="text-sm text-destructive">
          {persist.error?.message || "Settings couldn’t be loaded. Please try again."}
        </p>
      )}
      {draft && (
        <form onSubmit={submit} className="grid gap-5 rounded-lg border border-border bg-card p-6">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Switch
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
              aria-label="Assistant on"
            />
            {draft.enabled
              ? "Assistant is on — visitors can chat"
              : "Assistant is off — the chat bubble is hidden"}
          </label>
          <label className="text-sm font-semibold">
            Assistant name
            <input
              className={fieldClass}
              required
              maxLength={60}
              value={draft.assistant_name}
              onChange={(e) => setDraft({ ...draft, assistant_name: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            Welcome message
            <textarea
              className={`${fieldClass} h-28 resize-none py-3`}
              required
              maxLength={400}
              value={draft.greeting}
              onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {draft.greeting.length}/400 · shown as the first message when a visitor opens the chat
            </span>
          </label>
          {notice && (
            <p role="status" className="text-sm text-success">
              {notice}
            </p>
          )}
          <div>
            <Button type="submit" disabled={persist.isPending}>
              {persist.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
