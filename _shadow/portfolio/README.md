# Shadow: portfolio (manajer in-memory)

Dipindah dari `src/services/portfolio/` pada 2026-10-10 (15 file). Aktif: `performance/metrics.ts` (profit factor, expectancy, rata-rata untung/rugi) dan `performance/drawdown.ts`, dipakai `/api/portfolio/summary` dan kini ditampilkan di kartu "Kualitas Strategi" halaman Portfolio. Diuji dengan angka manual (PF 2,33; expectancy 40; drawdown -8%): benar.

Sisanya (`manager`, `tracker`, `registry`, `balance/*`, `position/*`, `pnl/*`, `equityCurve`, `types`, `index`) adalah pengelola posisi/saldo in-memory yang menduplikasi sumber kebenaran sebenarnya: Firestore (`paper_portfolio`, `paper_positions`, `bot_state`) dan saldo asli Indodax. Dua sumber kebenaran untuk posisi berisiko.

## Syarat aktif kembali
Equity curve historis (snapshot ekuitas per siklus ke Firestore) dibutuhkan; `equityCurve.ts` bisa jadi dasar, tapi sebagai fungsi murni di atas data tersimpan.
