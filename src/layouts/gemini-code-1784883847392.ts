'use client';

interface HeaderProps {
  pair?: string;
  isOnline?: boolean;
}

export default function Header({ pair = 'BTC/IDR', isOnline = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex justify-between items-center">
      {/* Brand & Active Market */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold tracking-wider text-emerald-400">
            Auto<span className="text-white">IDX</span>
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
          <span className="text-xs text-gray-400 font-medium">PAIR:</span>
          <span className="text-xs font-bold text-white tracking-wide">{pair}</span>
        </div>
      </div>

      {/* System Status Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          ></span>
          <span className="text-xs text-gray-300 font-mono">
            {isOnline ? 'CRON ACTIVE' : 'ENGINE OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}