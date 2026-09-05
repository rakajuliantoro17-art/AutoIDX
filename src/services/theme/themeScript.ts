/**
==========================================================
AURA Trade OS
Theme Script (shared, framework-agnostic)
Version : 0.1.0 Alpha
==========================================================
Modul polos (tanpa React / "use client") supaya aman diimpor
baik dari App Router (src/app/layout.tsx) maupun dari
Pages Router (src/pages/_document.tsx) tanpa menyeret konteks
React apa pun ke dalam berkas server-only seperti _document.tsx.
==========================================================
*/

export const THEME_STORAGE_KEY = "autoidx-theme";

export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;
