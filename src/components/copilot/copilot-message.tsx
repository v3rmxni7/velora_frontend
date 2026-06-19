"use client";

import type { CopilotMessage, CopilotProposedResult } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { ActionCard } from "./action-card";
import { ToolReceipt } from "./tool-receipt";

// A turn's tool_calls.result is one of three shapes: a PROPOSED action ({proposed,action}) → a
// confirm/cancel card; a confirmation receipt ({confirmed,…}) from the confirm route → nothing extra
// (the message content already states the outcome); or a read-tool result → a lookup receipt.
function asProposed(result: unknown): CopilotProposedResult | null {
  if (
    result &&
    typeof result === "object" &&
    (result as { proposed?: unknown }).proposed === true &&
    typeof (result as { action?: unknown }).action === "object"
  ) {
    return result as CopilotProposedResult;
  }
  return null;
}
function isConfirmationReceipt(result: unknown): boolean {
  return !!(result && typeof result === "object" && "confirmed" in result);
}

// One turn in the timeline. User turns sit right-aligned in a filled bubble; assistant turns sit
// left-aligned and may carry a tool receipt (read-only lookup) or an agentic action card.
export function CopilotMessageRow({
  message,
  threadId,
}: {
  message: CopilotMessage;
  threadId: string | null;
}) {
  const isUser = message.role === "user";
  const tc = message.tool_calls;
  const proposed = tc ? asProposed(tc.result) : null;
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-md px-3 py-2 text-sm whitespace-pre-wrap break-words",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground",
          )}
        >
          {message.content}
        </div>
        {!isUser &&
          tc &&
          (proposed
            ? threadId && (
                <ActionCard threadId={threadId} messageId={message.id} proposed={proposed.action} />
              )
            : isConfirmationReceipt(tc.result)
              ? null
              : <ToolReceipt call={tc} />)}
      </div>
    </div>
  );
}
