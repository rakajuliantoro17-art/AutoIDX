/**
==========================================================
AURA Trade OS
Activity Logs
Version : 0.0.1 Alpha
==========================================================
*/

interface ActivityItem {
  id: number;
  time: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  module: string;
  message: string;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    time: "2026-07-24 08:00:00",
    level: "INFO",
    module: "SYSTEM",
    message: "AutoIDX Engine started.",
  },
  {
    id: 2,
    time: "2026-07-24 08:05:00",
    level: "INFO",
    module: "SCANNER",
    message: "Scanning market pairs...",
  },
  {
    id: 3,
    time: "2026-07-24 08:05:10",
    level: "SUCCESS",
    module: "BOT",
    message: "No trading signal detected.",
  },
];

function badge(level: ActivityItem["level"]) {

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

export default function ActivityPage() {

  return (

    <section className="space-y-8">

      <div className="glass p-8">

        <h1 className="text-3xl font-bold">

          Activity Logs

        </h1>

        <p className="mt-2 text-slate-400">

          Riwayat aktivitas AutoIDX selama proses scanning,
          analisis, dan eksekusi trading.

        </p>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-4">

        <div className="card">

          <p className="text-sm text-slate-400">

            Total Events

          </p>

          <h2 className="mt-2 text-2xl font-bold">

            {activities.length}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Success

          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-400">

            {activities.filter(a => a.level === "SUCCESS").length}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Warning

          </p>

          <h2 className="mt-2 text-2xl font-bold text-yellow-400">

            {activities.filter(a => a.level === "WARNING").length}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Error

          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-400">

            {activities.filter(a => a.level === "ERROR").length}

          </h2>

        </div>

      </div>

      {/* Activity Table */}

      <div className="card overflow-x-auto">

        <table className="w-full">

          <thead className="border-b border-white/10">

            <tr>

              <th className="py-3 text-left">Time</th>

              <th className="text-left">Level</th>

              <th className="text-left">Module</th>

              <th className="text-left">Message</th>

            </tr>

          </thead>

          <tbody>

            {activities.map((item) => (

              <tr
                key={item.id}
                className="border-b border-white/5"
              >

                <td className="py-4">

                  {item.time}

                </td>

                <td>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(item.level)}`}
                  >

                    {item.level}

                  </span>

                </td>

                <td>

                  {item.module}

                </td>

                <td>

                  {item.message}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>

  );

}
