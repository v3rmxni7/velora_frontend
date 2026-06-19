"use client";

import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SuggestedAction } from "@/lib/api-types";
import {
  useCopilotMessages,
  useCreateThread,
  useSendMessage,
  useSuggestedActions,
} from "@/lib/hooks/use-copilot";
import { cn } from "@/lib/utils";
import { CopilotMessageRow } from "./copilot-message";

const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

// The four real read-only tools the planner can route to — surfaced as honest "/" quick-inserts
// (typing "/" inserts a prompt the planner then routes; it is NOT a fabricated command system).
const TOOL_PROMPTS: SuggestedAction[] = [
  { label: "Suggest ICP personas from my knowledge base", prompt: "Suggest ICP personas from my knowledge base" },
  { label: "Summarize my knowledge base", prompt: "Summarize my knowledge base" },
  { label: "List my leads", prompt: "List my leads" },
  { label: "List my lists", prompt: "List my lists" },
];

/** A thread title derived from the first message — gives real titles without a rename route. */
function titleFrom(content: string): string {
  const t = content.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start" role="status" aria-live="polite">
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
  const [slashDismissed, setSlashDismissed] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  // Synchronous in-flight latch — guards against a second send landing before React re-renders
  // `busy` to true (e.g. two fast Enter presses creating two threads).
  const submittingRef = useRef(false);
  const listboxId = useId();

  const busy = send.isPending || createThread.isPending;
  const rows = messages.data?.data ?? [];
  const isEmpty = !threadId || (messages.isSuccess && rows.length === 0);

  // Slash quick-inserts: when the composer starts with "/", surface the account-state suggested
  // actions + the four tool prompts (deduped), filtered by the text after the slash.
  const slashQuery = input.startsWith("/") ? input.slice(1).toLowerCase() : null;
  const slashItems = useMemo(() => {
    if (slashQuery === null) return [];
    const merged = [...(suggested.data?.actions ?? []), ...TOOL_PROMPTS];
    const seen = new Set<string>();
    return merged.filter((a) => {
      const key = a.prompt.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return a.label.toLowerCase().includes(slashQuery) || key.includes(slashQuery);
    });
  }, [slashQuery, suggested.data]);
  const slashOpen = slashQuery !== null && !slashDismissed && slashItems.length > 0;
  // Clamp the highlighted index to the (re-filtered) list so it can never point out of bounds.
  const activeOption = slashItems.length ? Math.min(activeIdx, slashItems.length - 1) : 0;

  // Keep the latest turn in view as messages land, while Ava is thinking, and on thread switch.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [threadId, rows.length, busy]);

  // Auto-grow the composer up to max-h-40 (160px); shrinks back when cleared after a send.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Dismiss the slash menu on any pointer-down outside the composer (the menu lives inside it).
  useEffect(() => {
    if (!slashOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        setSlashDismissed(true);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [slashOpen]);

  async function submit(text: string) {
    const content = text.trim();
    if (!content || busy || submittingRef.current) return;
    submittingRef.current = true;
    setInput("");
    try {
      let id = threadId;
      if (!id) {
        // Lazy thread creation, titled by the first message (no rename route exists).
        const created = await createThread.mutateAsync(titleFrom(content));
        id = created.data.id;
        onSelectThread(id);
      }
      await send.mutateAsync({ threadId: id, content });
    } catch {
      // Create/send failed (the hooks already toast). Restore the text so it isn't lost.
      setInput(content);
    } finally {
      submittingRef.current = false;
    }
  }

  function applySlash(prompt: string) {
    setSlashDismissed(true);
    setInput(prompt);
    textareaRef.current?.focus();
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setSlashDismissed(false);
    setActiveIdx(0);
    setInput(e.target.value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (slashOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashDismissed(true);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(Math.min(activeOption + 1, slashItems.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx(Math.max(activeOption - 1, 0));
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // With the slash menu open, Enter picks the highlighted quick-insert (not "/…" sent literally).
      if (slashOpen) {
        const pick = slashItems[activeOption];
        if (pick) applySlash(pick.prompt);
        return;
      }
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
              <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
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
          <CopilotMessageRow key={m.id} message={m} threadId={threadId} />
        ))}
        {busy && <ThinkingBubble />}
      </div>

      {/* Composer */}
      <div ref={composerRef} className="relative border-t border-border bg-background p-3">
        {/* Slash quick-inserts — real suggested actions + tool prompts; clicking fills the composer */}
        {slashOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-md border border-border bg-popover ring-1 ring-foreground/10">
            <div className="border-b border-border/60 px-2.5 py-1.5">
              <span className={EYEBROW}>Quick prompts</span>
            </div>
            <ul id={listboxId} role="listbox" className="max-h-56 overflow-auto py-1">
              {slashItems.map((a, i) => {
                const active = i === activeOption;
                return (
                  <li key={a.prompt}>
                    <button
                      type="button"
                      id={`${listboxId}-${i}`}
                      role="option"
                      aria-selected={active}
                      onClick={() => applySlash(a.prompt)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm text-foreground transition-colors",
                        active ? "bg-accent" : "hover:bg-accent",
                      )}
                    >
                      <span className="truncate">{a.label}</span>
                      {active && (
                        <CornerDownLeft className="size-3 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-md border border-border bg-card px-2.5 py-2 focus-within:border-ring">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onChange}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message Ava…  (type / for quick prompts)"
            disabled={busy}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={slashOpen}
            aria-controls={slashOpen ? listboxId : undefined}
            aria-activedescendant={slashOpen ? `${listboxId}-${activeOption}` : undefined}
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
