/**
==========================================================
AURA Trade OS
User Menu (Header)
Version : 0.1.0

Perubahan dari 0.0.2: email disembunyikan penuh di layar
sempit (hidden sm:inline) tanpa pengganti apa pun -- di mobile,
cuma tombol "Keluar" yang terlihat, tidak ada indikasi akun
mana yang sedang login. Sekarang ditambah avatar inisial
(huruf pertama email) yang SELALU terlihat, termasuk di mobile.
==========================================================
*/

"use client";

import { useAuth } from "@/services/auth/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="glass flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--text)] sm:hidden"
        title={user.email ?? undefined}
      >
        {initial}
      </div>

      <span className="hidden text-sm text-slate-300 sm:inline">
        {user.email}
      </span>

      <button
        onClick={() => logout()}
        className="rounded-full border border-white/10 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 sm:px-3"
      >
        Keluar
      </button>
    </div>
  );
}
