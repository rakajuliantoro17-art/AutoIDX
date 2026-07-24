interface StatusCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export default function StatusCard({ title, value, subtext, trend, loading }: StatusCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-gray-300';
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl backdrop-blur-sm shadow-md hover:border-slate-600 transition">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        {loading ? (
          <div className="h-7 w-24 bg-slate-700/50 animate-pulse rounded"></div>
        ) : (
          <p className={`text-2xl font-bold tracking-tight ${getTrendColor()}`}>{value}</p>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}
