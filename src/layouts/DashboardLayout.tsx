/**
==========================================================
AURA Trade OS
Dashboard Layout (Pages Router)
Version : 0.2.0

Perubahan dari 0.0.1: sebelumnya Sidebar.tsx statis (list menu
sendiri, hilang beberapa item dibanding sisi App Router) tanpa
mode mobile sama sekali -- di layar sempit sidebar itu langsung
disembunyikan total (`hidden md:block`) tanpa cara lain untuk
membukanya. Sekarang pakai AppSidebar bersama (satu sumber menu
di navigation.ts) dengan rail mode + drawer mobile yang bisa
dibuka dari tombol hamburger di Header.
==========================================================
*/

import { useRouter } from "next/router";
import Header from "./Header";
import Footer from "./Footer";
import AppSidebar from "./shell/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">

      <Header />

      <div className="flex flex-1">
        <AppSidebar pathname={router.pathname} />
        <main className="w-full flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>

      <Footer />

    </div>
  );

}
