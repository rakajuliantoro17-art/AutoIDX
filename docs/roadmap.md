# 🗺️ AutoIDX - Project Roadmap

Dokumen ini memuat peta jalan (*roadmap*) pengembangan bot trading **AutoIDX** dari fase awal hingga fitur tingkat lanjut.

---

## 🚩 Phase 1: Core Foundation & Deployment (Current)
* [x] Inisialisasi struktur proyek modular Python.
* [x] Integrasi Indodax Public API (Ticker & Market Depth).
* [x] Integrasi Indodax Private API (TAPI) dengan autentikasi HMAC-SHA512.
* [x] Implementasi strategi dasar: EMA Crossover + RSI Filter.
* [x] Modul Manajemen Risiko (Take-Profit & Stop-Loss).
* [x] Deployment ke Vercel Serverless Architecture dengan Vercel Cron.
* [x] Dokumentasi API & Arsitektur Sistem.

---

## 📈 Phase 2: Enhanced Strategy & Risk Management
* [ ] **Multi-Pair Monitoring:** Kemampuan bot untuk melakukan scanning dan trading di beberapa *pair* Indodax secara serentak (misal: BTC/IDR, ETH/IDR, SOL/IDR).
* [ ] **Dynamic Trailing Stop:** Menggeser batas *Stop-Loss* secara otomatis mengikuti kenaikan harga untuk mengunci *profit* maksimal.
* [ ] **Backtesting Engine:** Modul simulasi untuk menguji performa strategi menggunakan data histori harga Indodax sebelum dipasang di pasar *live*.
* [ ] **Additional Technical Indicators:** Penambahan indikator MACD, Bollinger Bands, dan ATR (Average True Range) untuk akurasi sinyal yang lebih tinggi.

---

## 🔔 Phase 3: Notifications & Dashboard
* [ ] **Telegram / Discord Bot Notifications:**
  * Notifikasi *real-time* saat eksekusi `BUY` atau `SELL`.
  * Alert harian/mingguan rangkuman PnL (Profit & Loss).
  * Peringatan darurat jika terjadi kesalahan API atau saldo tidak mencukupi.
* [ ] **Web Dashboard (Vercel Frontend):**
  * Tampilan visual grafis harga & eksekusi order menggunakan React / Next.js.
  * Ringkasan portofolio dan *win-rate* strategi.
  * *Control panel* untuk mengubah parameter bot (SL, TP, Pair) secara langsung dari antarmuka web.

---

## 🛡️ Phase 4: Security, Resilience & Optimization
* [ ] **Database Integration:** Menyimpan histori transaksi dan *state* posisi bot secara permanen menggunakan Vercel Postgres / Supabase / Redis.
* [ ] **Slippage & Order Execution Optimization:** Penyesuaian skema order (Limit vs Market) untuk menghindari *slippage* tinggi pada pasar bertransaksi rendah.
* [ ] **Advanced Logging & Monitoring:** Integrasi *logging* error terpusat (misal: Sentry) untuk memantau performa *serverless function*.
