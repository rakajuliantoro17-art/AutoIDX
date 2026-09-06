"use client";

/**
==========================================================
AURA Trade OS
Theme Toggle Button
Version : 0.1.0
==========================================================
*/

import { useTheme } from "@/services/theme/ThemeContext";
import { IconMoon, IconSun } from "@/components/icons";

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
        <IconSun className="h-[18px] w-[18px]" />
      ) : (
        <IconMoon className="h-[18px] w-[18px]" />
      )}
    </button>
  );

}
