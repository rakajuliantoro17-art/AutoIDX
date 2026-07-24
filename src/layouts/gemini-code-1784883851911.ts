'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Analisa Teknikal', href: '/analytics', icon: '📈' },
    { name: 'Histori Transaksi', href: '/history', icon: '📜' },
    { name: 'Pengaturan Bot', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Navigation Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Account Info Card / Footer Sidebar */}
      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs">
        <p className="text-gray-400 font-medium">Engine Mode</p>
        <p className="text-emerald-400 font-mono font-bold mt-0.5">Vercel Cron / API</p>
      </div>
    </aside>
  );
}