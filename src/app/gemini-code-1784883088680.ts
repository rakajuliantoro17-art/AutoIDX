import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoIDX Dashboard | Indodax Bot',
  description: 'Automated Indodax Crypto Trading Bot Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <header className="border-b border-gray-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold tracking-wider text-emerald-400">
              Auto<span className="text-white">IDX</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-gray-400">System Active</span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}