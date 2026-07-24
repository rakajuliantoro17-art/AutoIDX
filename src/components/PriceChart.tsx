interface LogItem {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface ActivityLogsProps {
  logs: LogItem[];
}

export default function ActivityLogs({ logs }: ActivityLogsProps) {
  const getTypeColor = (type: LogItem['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'danger':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-inner">
      <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
        <span className="text-gray-400 font-sans font-semibold text-sm"> Live Activity Logs</span>
        <span className="text-gray-600 text-[10px]">Realtime Engine Events</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-gray-600 italic">Belum ada riwayat aktivitas...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 text-slate-300">
              <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
              <span className={getTypeColor(log.type)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
