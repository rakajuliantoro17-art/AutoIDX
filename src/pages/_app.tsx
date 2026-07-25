/**
==========================================================
AURA Trade OS
Custom App
Version : 0.0.2 Alpha
==========================================================
*/
import type { AppProps } from "next/app";
import "@/app/globals.css";
import { AuthProvider } from "@/services/auth/AuthContext";
import PagesRouteGuard from "@/components/auth/PagesRouteGuard";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PagesRouteGuard>
        <Component {...pageProps} />
      </PagesRouteGuard>
    </AuthProvider>
  );
}
