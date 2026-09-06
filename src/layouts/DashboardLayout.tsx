"use client";

/**
==========================================================
AURA Trade OS
Dashboard Layout (Pages Router)
Version : 0.3.0

Perubahan dari 0.2.0: Header.tsx & Footer.tsx (implementasi
terpisah, sempat beda dari App Router -- Header lama tidak
punya logo gambar, Footer lama nomor versinya tidak sinkron)
diganti dengan AppHeader.tsx / AppFooter.tsx yang sama persis
dipakai App Router lewat AppShell.tsx.
==========================================================
*/

import { useRouter } from "next/router";
import AppHeader from "./shell/AppHeader";
import AppFooter from "./shell/AppFooter";
import AppSidebar from "./shell/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex flex-1">
        <AppSidebar pathname={router.pathname} />
        <main className="w-full flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  );
}
