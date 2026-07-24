interface RiskBadgeProps {
  signal: 'BUY' | 'SELL' | 'HOLD' | string;
}

export default function RiskBadge({ signal }: RiskBadgeProps) {
  const getStyle = () => {
    switch (signal) {
      case 'BUY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SELL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/30 text-gray-400 border-slate-600/40';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      <span
        className={`mr-1.5 h-2 w-2 rounded-full ${
          signal === 'BUY'
            ? 'bg-emerald-400 animate-ping'
            : signal === 'SELL'
            ? 'bg-rose-400 animate-ping'
            : 'bg-gray-400'
        }`}
      ></span>
      {signal}
    </span>
  );
}