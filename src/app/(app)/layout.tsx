import { Sidebar } from "@/components/shell/sidebar";

// Protected shell — the proxy gate (src/proxy.ts) redirects unauthenticated traffic to
// /login before any page in this group renders.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}