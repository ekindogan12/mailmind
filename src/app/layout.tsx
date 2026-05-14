import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MailMind — AI-First Email Client",
  description: "A universal AI-powered email client with smart summaries, reply drafts, and intelligent prioritization. Supports Gmail, Outlook, and IMAP.",
  manifest: "/manifest.json",
  keywords: ["email", "AI", "Gmail", "Outlook", "IMAP", "email client", "PWA"],
  icons: [
    { rel: "icon", url: "/icons/icon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icons/icon-512.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
