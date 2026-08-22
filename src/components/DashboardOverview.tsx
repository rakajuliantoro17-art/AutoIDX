/**
==========================================================
AURA Trade OS
Dashboard Overview (sub-component)
Version : 0.1.0 Alpha

Perubahan dari 0.0.1: sebelumnya SELURUH isi komponen ini
hardcode (Rp 100.000, BTC_IDR, RUNNING, HOLD 50% -- statis
selamanya) DAN orphan total (tidak diimpor pages/dashboard/
index.tsx yang justru sudah py fetch data asli sendiri secara
inline, terpisah dari komponen ini).

Sekarang jadi komponen PRESENTASIONAL murni (terima semua data
lewat props, tidak fetch apa pun sendiri) yang menyerap JSX
inline pages/dashboard/index.tsx SEKALIGUS menggabungkan
RecentActivity.tsx dan BacktestSummary.tsx (dua widget orphan
lain yang senasib) jadi satu dashboard utuh -- lihat
docs/claude.md "Session Log 7" untuk detail penuh keputusan
integrasi 4 komponen orphan ini.
==========================================================
*/
import StatusCard from "@/components/StatusCard";
import PriceChart from "@/components/PriceChart";
import RiskBadge from "@/components/RiskBadge";
import RecentActivity, { type ActivityLog } from "@/components/RecentActivity";
import BacktestSummary from "@/components/BacktestSummary";
import ActivityView from "@/components/ActivityView";

export interface DashboardOverviewData {
  price: number;
  signal: "BUY" | "SELL" | "HOLD";
  position: string;
  stopLoss: number;
  takeProfit: number;
  loading: boolean;
}

interface DashboardOverviewProps {
  data: DashboardOverviewData;
  logs: ActivityLog[];
  logsLoading?: boolean;
  pair?: string;
}

export default function DashboardOverview({
  data,
  logs,
  logsLoading = false,
  pair = "btc_idr",
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-xs text-slate-400">
            {pair.replace("_", "/").toUpperCase()} -- siklus terakhir
          </p>
        </div>
        <RiskBadge signal={data.signal} />
      </div>
      <div className="grid md:grid-cols-4 gap-5">
        <StatusCard
          title="Price"
          value={data.loading ? "..." : `Rp ${(data.price ?? 0).toLocaleString("id-ID")}`}
          icon="💰"
          loading={data.loading}
        />
        <StatusCard title="Position" value={data.position} icon="📊" />
        <StatusCard
          title="Active Pair"
          value={pair.replace("_", "/").toUpperCase()}
          icon="🪙"
        />
        <StatusCard
          title="Risk (SL/TP)"
          value={`${data.stopLoss}% / ${data.takeProfit}%`}
          icon="🤖"
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart pair={pair} />
          <BacktestSummary />
        </div>
        <div>
          <RecentActivity logs={logs} loading={logsLoading} />
        </div>
      </div>
      <ActivityView logs={logs} />
    </div>
  );
}
