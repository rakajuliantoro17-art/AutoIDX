/**
==========================================================
AURA Trade OS
Root Layout
Version : 0.1.0

Perubahan dari 0.0.3: markup header/sidebar/footer dipindah ke
AppShell.tsx (Client Component) supaya file ini bisa tetap
Server Component (perlu untuk `export const metadata`). Tambah
skrip anti-flash tema inline di <head> -- SEBELUM ini, halaman
App Router (Scanner, Portfolio, Activity, Backtest, Settings)
akan selalu flash dark sesaat sebelum ThemeContext aktif.
==========================================================
*/
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/services/auth/AuthContext";
import AppShell from "@/layouts/shell/AppShell";
import { THEME_INIT_SCRIPT } from "@/services/theme/themeScript";

export const metadata: Metadata = {
  title: "AutoIDX • Automated Indodax Trading Engine",
  description: "AI-powered automated crypto trading dashboard for Indodax.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
