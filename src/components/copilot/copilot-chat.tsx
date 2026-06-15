"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCopilotMessages,
  useCreateThread,
  useSendMessage,
  useSuggestedActions,
} from "@/lib/hooks/use-copilot";
import { CopilotMessageRow } from "./copilot-message";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

/** A thread title derived from the first message — gives real titles without a rename route. */
function titleFrom(content: string): string {
  const t = content.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
        <span className="ml-1 font-mono text-[11px] text-muted-foreground">Ava is thinking…</span>
      </div>
    </div>
  );
}

export function CopilotChat({
  threadId,
  onSelectThread,
}: {
  threadId: string | null;
  onSelectThread: (id: string) => void;
}) {
  const messages = useCopilotMessages(threadId);
  const suggested = useSuggestedActions();
  const send = useSendMessage();
  const createThread = useCreateThread();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = send.isPending || createThread.isPending;
  const rows = messages.data?.data ?? [];
  const isEmpty = !threadId || (messages.isSuccess && rows.length === 0);

  // Keep the latest turn in view as messages land and while Ava is thinking.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [rows.length, busy]);

  async function submit(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    let id = threadId;
    if (!id) {
      // Lazy thread creation, titled by the first message (no rename route exists).
      const created = await createThread.mutateAsync(titleFrom(content));
      id = created.data.id;
      onSelectThread(id);
    }
    send.mutate({ threadId: id, content });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(input);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Timeline */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {threadId && messages.isPending && (
          <div className="space-y-3">
            <Skeleton className="ml-auto h-9 w-40 rounded-md" />
            <Skeleton className="h-16 w-64 rounded-md" />
          </div>
        )}
        {threadId && messages.isError && (
          <p className="font-mono text-xs text-destructive">Couldn’t load this conversation.</p>
        )}

        {isEmpty && !busy && (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
                <Sparkles className="size-4" />
              </span>
              <p className="text-sm font-medium text-foreground">Ask Ava</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Ava can read your knowledge base, leads, and lists — and shows you exactly what it
                looked up.
              </p>
            </div>
            {suggested.isSuccess && suggested.data.actions.length > 0 && (
              <div className="flex w-full max-w-sm flex-col gap-2">
                <span className={EYEBROW}>Try</span>
                {suggested.data.actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => void submit(a.prompt)}
                    disabled={busy}
                    className="rounded-md border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {rows.map((m) => (
          <CopilotMessageRow key={m.id} message={m} />
        ))}
        {busy && <ThinkingBubble />}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3">
        <div className="flex items-end gap-2 rounded-md border border-border bg-card px-2.5 py-2 focus-within:border-ring">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message Ava…"
            disabled={busy}
            className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <Button
            size="icon-sm"
            onClick={() => void submit(input)}
            disabled={busy || !input.trim()}
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 px-1 font-mono text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for a new line · read-only — Ava never sends or changes
          anything
        </p>
      </div>
    </div>
  );
}
