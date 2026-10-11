# Shadow: non-services (di luar `src/services`)

Dipindah pada 2026-10-11. Hasil pemindaian orphan `src/components`, `src/config`, `src/lib`, `src/scripts`.

| File | Alasan / padanan aktif |
|---|---|
| `components/DashboardOverview`, `RecentActivity`, `ActivityView` | dashboard lama; digantikan `pages/dashboard/index.tsx` + `ActivityLogs` |
| `components/BacktestSummary` | kartu placeholder tautan ke /backtest, tanpa data nyata |
| `config/env.ts` | konfigurasi env terpusat paralel (sumber kebenaran aktif: `config/risk.ts`, `config/trading.ts`, `services/firebase/admin.ts`). Dua sumber env berisiko tak sinkron |
| `lib/validators/{config,order,portfolio,scanner,strategy,trade,trading}` + `index` | validator generik; validasi aktif memakai `api/settings/validate.ts` (number/risk/pair/market) dan `timeframe`/`api`. Aturan order/risk nyata ada di `trading/engine.ts` + `RiskManager` |

## Diintegrasikan (bukan shadow)
- `scripts/validateEnv.ts` -> `npm run check:env` (daftar variabel dikoreksi: `FIREBASE_ADMIN_*`, `ACCOUNT_ENCRYPTION_KEY`, `BOT_OWNER_UID`; kunci Indodax global jadi opsional)
- `scripts/checkBuild.ts` -> `npm run check:build` (tidak lagi mensyaratkan `config/env.ts`)

## Syarat aktif kembali
Satu sumber env saja; validator order dipakai bila ada jalur order limit/stop baru (uji paper dulu).
