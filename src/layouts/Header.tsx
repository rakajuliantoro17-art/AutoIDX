/**
==========================================================
AURA Trade OS
Dashboard Header
Version : 0.0.2 Alpha
==========================================================
*/

export default function Header() {
  return (
    <header className="glass-nav sticky top-0 z-40 border-b">
      <div className="h-16 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Auto<span className="brand-gradient">IDX</span>
          </h1>
          <p className="text-xs text-slate-500">Automated Trading Engine</p>
        </div>

        <div className="glass flex items-center gap-3 rounded-full px-4 py-2">
          <span className="status-dot status-online animate-pulse" />
          <span className="text-sm text-slate-300">SYSTEM ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
