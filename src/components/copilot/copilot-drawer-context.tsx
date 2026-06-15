"use client";

import { createContext, useContext, useMemo, useState } from "react";

// Global open-state for the slide-out copilot drawer. Lives above the sidebar (the trigger) and the
// drawer panel so the footer "Chat with Ava" button can open the same panel from anywhere in the app.
type CopilotDrawerCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openDrawer: () => void;
};

const Ctx = createContext<CopilotDrawerCtx | null>(null);

export function CopilotDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen, openDrawer: () => setOpen(true) }), [open]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCopilotDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCopilotDrawer must be used within CopilotDrawerProvider");
  return ctx;
}
