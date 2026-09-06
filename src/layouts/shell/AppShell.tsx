"use client";

/**
==========================================================
AURA Trade OS
App Shell (App Router)
Version : 0.2.0

Dipisah dari src/app/layout.tsx supaya layout.tsx bisa tetap
Server Component (butuh `export const metadata`, yang tidak
boleh ada di file "use client"). Semua yang butuh hook client
(usePathname, ThemeProvider, SidebarProvider) tinggal di sini.

Perubahan dari 0.1.0: header & footer inline sebelumnya
sekarang diekstrak ke AppHeader.tsx / AppFooter.tsx (dipakai
bersama Pages Router lewat DashboardLayout.tsx), supaya kedua
router menghasilkan tampilan yang identik.
==========================================================
*/

import { usePathname } from "next/navigation";
import RouteGuard from "@/components/auth/RouteGuard";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import AppSidebar from "./AppSidebar";
import { ThemeProvider } from "@/services/theme/ThemeContext";
import { SidebarProvider } from "@/services/sidebar/SidebarContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />

          <div className="flex flex-1">
            <AppSidebar pathname={pathname} />
            <main className="w-full flex-1 px-4 py-6 md:px-6 md:py-8">
              <RouteGuard>{children}</RouteGuard>
            </main>
          </div>

          <AppFooter />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
