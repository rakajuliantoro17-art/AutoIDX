/**
==========================================================
AURA Trade OS
Route Guard
Version : 0.0.2 Alpha

Proteksi level UX: redirect ke /login kalau belum login.
CATATAN KEAMANAN: ini BUKAN batas keamanan sesungguhnya --
proteksi data yang sebenarnya ada di lapisan API (verifikasi
token di server), bukan di sini. Guard ini cuma mencegah
orang "kelihatan" halaman dashboard tanpa login lewat browser
biasa.
==========================================================
*/

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/AuthContext";

const PUBLIC_PATHS = ["/login"];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace("/login");
    }

    if (user && isPublicPath) {
      router.replace("/dashboard");
    }
  }, [user, loading, isPublicPath, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-400">Memuat sesi...</p>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    // Sedang proses redirect, jangan render konten protected sekejap pun.
    return null;
  }

  return <>{children}</>;
}
