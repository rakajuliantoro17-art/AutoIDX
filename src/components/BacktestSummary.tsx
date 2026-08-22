/**
==========================================================
AURA Trade OS
Backtest Summary Widget (migrated from App Router)
Version : 0.1.0 Alpha

Perubahan dari 0.0.1: sebelumnya `summary` object statis
hardcode (trades:0, winRate:0, profit:0 SELAMANYA) -- komponen
ini juga orphan total. PENTING: /api/backtest/run TIDAK persist
hasilnya ke Firestore (stateless, cuma dikembalikan di response
sekali panggil dari src/app/backtest/page.tsx) -- jadi TIDAK ADA
"hasil backtest terakhir" yang benar-benar bisa diambil ulang di
sini. Daripada menampilkan data statis yang terlihat seperti
data asli (menyesatkan, sama seperti masalah awal komponen ini),
widget ini SEKARANG jadi kartu ringkasan + link jujur ke
halaman /backtest yang lengkap (form + hasil sungguhan) --
BUKAN pura-pura py hasil.
==========================================================
*/
import Link from "next/link";

const STRATEGY_LABEL = "AURA Trend (EMA + MACD + ADX + RSI)";

export default function BacktestSummary() {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Backtesting</h2>
          <p className="text-sm text-slate-400">Strategi default saat ini</p>
        </div>
        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-400">
          Belum dijalankan
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-500">Strategy</p>
        <p className="font-semibold mt-1">{STRATEGY_LABEL}</p>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-white/10 p-4">
        <p className="text-sm text-slate-400">
          Belum ada hasil backtest yang dijalankan dari dashboard ini.
          Hasil backtest tidak disimpan otomatis -- jalankan simulasi
          penuh (pilih pair/timeframe/periode/strategi) di halaman
          Backtest.
        </p>
        <Link
          href="/backtest"
          className="mt-4 inline-block rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          Jalankan Backtest →
        </Link>
      </div>
    </section>
  );
}
