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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
