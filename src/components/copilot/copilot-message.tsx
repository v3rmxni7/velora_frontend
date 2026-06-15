"use client";

import type { CopilotMessage } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { ToolReceipt } from "./tool-receipt";

// One turn in the timeline. User turns sit right-aligned in a filled bubble; assistant turns sit
// left-aligned and, when the planner ran a tool, carry the receipt of what it looked up.
export function CopilotMessageRow({ message }: { message: CopilotMessage }) {
  const isUser = message.role === "user";
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
        {!isUser && message.tool_calls && <ToolReceipt call={message.tool_calls} />}
      </div>
    </div>
  );
}
