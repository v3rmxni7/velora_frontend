"use client";

import { toast } from "sonner";

/** Copy text to the clipboard with a toast confirmation. Returns an async copy fn. */
export function useCopyToClipboard() {
  return async (text: string, label = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Couldn’t copy — select the text and copy manually.");
    }
  };
}
