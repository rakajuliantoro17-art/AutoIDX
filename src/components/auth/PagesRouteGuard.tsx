/**
==========================================================
AURA Trade OS
Route Guard (Pages Router)
Version : 0.0.2 Alpha

Sama fungsinya dengan components/auth/RouteGuard.tsx, tapi
untuk Pages Router (src/pages/*) yang pakai next/router,
bukan next/navigation. App Router dan Pages Router punya API
routing yang berbeda dan tidak saling kompatibel.

CATATAN KEAMANAN: sama seperti versi App Router, ini proteksi
level UX (redirect di client), bukan batas keamanan
sesungguhnya. Data yang benar-benar sensitif harus divalidasi
ulang di API/server.
==========================================================
*/

"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/AuthContext";

const PUBLIC_PATHS = ["/login"];

export default function PagesRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(router.pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace("/login");
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
    return null;
  }

  return <>{children}</>;
}
