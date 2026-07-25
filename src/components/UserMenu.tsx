/**
==========================================================
AURA Trade OS
User Menu (Header)
Version : 0.0.2 Alpha
==========================================================
*/

"use client";

import { useAuth } from "@/services/auth/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-300 hidden sm:inline">
        {user.email}
      </span>

      <button
        onClick={() => logout()}
        className="text-xs font-medium rounded-full border border-white/10 px-3 py-1.5 text-slate-300 hover:bg-white/5 transition"
      >
        Keluar
      </button>
    </div>
  );
}
