"use client";

/**
==========================================================
AURA Trade OS
Theme Toggle Button
Version : 0.1.1

FIX BUG (audit sesi ini): file ini SEBELUMNYA isinya kepasang
KEMBAR/SALIN dari SystemStatusPopover.tsx (identik persis,
diverifikasi karakter-per-karakter) - bukan tombol ganti tema
sama sekali. Header.tsx & AppHeader.tsx sama-sama merender
<SystemStatusPopover /> DAN <ThemeToggleButton /> berdampingan,
sehingga yang tampil di production adalah DUA ikon status
sistem yang identik, dan tombol dark/light TIDAK PERNAH ada di
UI sama sekali - walau seluruh infrastruktur tema (ThemeContext,
ThemeProvider, script anti-flash di _document.tsx) sudah benar
dan aktif. Ditulis ulang di sini sesuai nama & tujuan filenya.
==========================================================
*/

import { useTheme } from "@/services/theme/ThemeContext";
import { IconSun, IconMoon } from "@/components/icons";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
      className="glass flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text)]"
    >
      {theme === "dark" ? (
        <IconSun className="h-5 w-5" />
      ) : (
        <IconMoon className="h-5 w-5" />
      )}
    </button>
  );
}
