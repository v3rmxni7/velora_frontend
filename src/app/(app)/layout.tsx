import { CopilotDrawer } from "@/components/copilot/copilot-drawer";
import { CopilotDrawerProvider } from "@/components/copilot/copilot-drawer-context";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBanner } from "@/components/shell/top-banner";

// Protected shell — the proxy gate (src/proxy.ts) redirects unauthenticated traffic to
// /login before any page in this group renders. A persistent top banner frames the whole app;
// the sidebar + page content fill the rest (min-h-0 so inner panes scroll). The copilot drawer is
// mounted once here and opened from the sidebar's "Chat with Ava" trigger (shared context).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <TopBanner />
      <CopilotDrawerProvider>
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
        <CopilotDrawer />
      </CopilotDrawerProvider>
    </div>
  );
}