/**
==========================================================
AURA Trade OS
Recent Activity Widget (migrated from App Router)
Version : 0.0.1 Alpha
==========================================================
*/
interface ActivityLog {
  id: number;
  time: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  message: string;
}

const logs: ActivityLog[] = [
  { id: 1, time: "08:00", level: "INFO", message: "Bot engine started." },
  { id: 2, time: "08:05", level: "SUCCESS", message: "Market scan completed." },
  { id: 3, time: "08:10", level: "INFO", message: "No BUY signal detected." },
];

function badgeColor(level: ActivityLog["level"]) {
  switch (level) {
    case "SUCCESS":
      return "bg-emerald-500/20 text-emerald-400";
    case "WARNING":
      return "bg-yellow-500/20 text-yellow-400";
    case "ERROR":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-sky-500/20 text-sky-400";
  }
}

export default function RecentActivity() {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <span className="text-xs text-slate-500">Last {logs.length} events</span>
      </div>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between border-b border-white/5 pb-3"
          >
            <div>
              <p className="font-medium">{log.message}</p>
              <p className="text-xs text-slate-500 mt-1">{log.time}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor(log.level)}`}>
              {log.level}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
