/**
==========================================================
AURA Trade OS
Custom App
Version : 0.0.1 Alpha
==========================================================
*/
import type { AppProps } from "next/app";
import "@/app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
