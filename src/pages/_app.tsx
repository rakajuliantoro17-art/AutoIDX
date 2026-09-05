/**
==========================================================
AURA Trade OS
Custom App
Version : 0.1.0

Sekarang dibungkus ThemeProvider + SidebarProvider supaya
seluruh halaman Pages Router (yang pakai DashboardLayout) bisa
akses useTheme()/useSidebar() -- provider dipasang SEKALI di
sini (bukan di dalam DashboardLayout) supaya state tema/rail
tidak reset tiap pindah halaman.
==========================================================
*/
import type { AppProps } from "next/app";
import "@/app/globals.css";
import { AuthProvider } from "@/services/auth/AuthContext";
import PagesRouteGuard from "@/components/auth/PagesRouteGuard";
import { ThemeProvider } from "@/services/theme/ThemeContext";
import { SidebarProvider } from "@/services/sidebar/SidebarContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <PagesRouteGuard>
            <Component {...pageProps} />
          </PagesRouteGuard>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
