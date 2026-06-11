import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query-provider";
// Type system: Bricolage Grotesque = display (titles, wordmark — sparing); IBM Plex Sans =
// UI/body; IBM Plex Mono = the evidence layer (confidence, sources, counts).
// Self-hosted via @fontsource (no build-time Google Fonts fetch — deterministic builds;
// this machine's TLS interception also blocks Turbopack's font fetcher).
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velora",
  description: "Autonomous AI BDR — grounded outreach your team can trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}