/**
==========================================================
AURA Trade OS
Dashboard Layout (App Router)
Version : 0.0.1 Alpha
==========================================================
*/

import Header from "./Header";
import SidebarAppRouter from "./SidebarAppRouter";
import Footer from "./Footer";

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <SidebarAppRouter />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
