/**
==========================================================
AURA Trade OS
Custom Document (Pages Router)
Version : 0.1.0

Sebelumnya TIDAK ADA sama sekali -- dibutuhkan supaya skrip
anti-flash tema bisa disisipkan sebelum React hydrate. Tanpa
ini, halaman Pages Router (mis. /dashboard, /dashboard/history)
akan selalu flash dark sesaat sebelum ThemeContext aktif,
walau user sudah memilih tema terang.

File ini SENGAJA tidak "use client" dan tidak import apa pun
dari React Context (ThemeContext.tsx) -- _document.tsx cuma
render SEKALI di server, mengimpor modul React Context ke sini
berisiko menyeret dependency yang tidak perlu. THEME_INIT_SCRIPT
diambil dari themeScript.ts (modul polos tanpa React) yang
memang dibuat untuk dipakai dari sini.
==========================================================
*/

import { Html, Head, Main, NextScript } from "next/document";
import { THEME_INIT_SCRIPT } from "@/services/theme/themeScript";

export default function Document() {

  return (
    <Html lang="id" suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </Head>
      <body className="antialiased" suppressHydrationWarning>
        <Main />
        <NextScript />
      </body>
    </Html>
  );

}
