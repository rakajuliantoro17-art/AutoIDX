/**
==========================================================
AURA Trade OS
Root Page
Version : 0.0.1 Alpha
==========================================================
Halaman "/" tidak punya konten sendiri -- langsung redirect
ke /dashboard. RouteGuard (di app/layout.tsx) yang menangani
kalau user belum login, akan dilempar ke /login otomatis.
==========================================================
*/

import { redirect } from "next/navigation";

export default function RootPage() {

    redirect("/dashboard");

}
