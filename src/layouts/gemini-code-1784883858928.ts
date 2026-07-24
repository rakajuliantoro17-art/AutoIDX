'use client';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Header Atas */}
      <Header pair="BTC/IDR" isOnline={true} />

      {/* Konten Utama + Sidebar */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}