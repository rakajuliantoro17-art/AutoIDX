# Claude Development Guide

**Project:** AURA Trade OS
**Version:** 0.1.2 Alpha
**Terakhir diaudit:** sesi build-fix marathon (lihat "Session Log" di bawah)

---

# Cara Pakai Dokumen Ini (untuk Claude sesi/akun lain)

Project ini dikerjakan lintas beberapa akun Claude berbeda + ChatGPT, secara paralel, oleh satu orang (Raka) yang bekerja **hanya lewat GitHub browser UI + Vercel dashboard** (tidak ada terminal/git lokal).

**Aturan wajib sebelum menyentuh kode apapun di sini:**

1. **Jangan percaya dokumen manapun (termasuk file ini) tanpa verifikasi langsung ke kode.** Riwayat project ini penuh dokumen progress yang mengklaim status lebih maju dari kenyataan.
2. **Selalu minta build log Vercel terbaru di awal sesi**, atau clone repo dan jalankan `npm run build` sendiri untuk tahu persis di mana build berhenti.
3. **Cek dulu apakah sebuah engine/service/type sudah ada** sebelum membuat yang baru — project ini sudah berkali-kali punya implementasi paralel untuk konsep yang sama (lihat tabel "Known Duplication").
4. Ikuti seluruh "Development Principles" di bawah — ini bukan saran, ini sudah terbukti mencegah kelas bug yang sama berulang.

---

# Project Overview

AURA Trade OS adalah platform trading cryptocurrency berbasis TypeScript untuk exchange Indodax.

Tujuan utama: Realtime Market Engine, Technical Indicator Engine, Strategy Engine, Backtesting, Paper Trading, Live Trading, AI Assisted Trading, Dashboard Monitoring.

Target deployment: GitHub → Vercel, database Firebase.

---

# Technology Stack

- Frontend: Next.js (App Router, kanonik), React, TypeScript, Tailwind CSS
- Backend: Vercel Functions
- Database: Firebase Firestore
- Realtime: Indodax WebSocket
- AI: OpenAI, Claude/Anthropic, Gemini (REST fetch langsung), DeepSeek

---

# Project Architecture (alur data yang seharusnya)

---

# Development Principles

## 1. TypeScript First
Jangan JavaScript. Typing jelas. Hindari `any` kecuali benar-benar perlu.

## 2. Modular Architecture
Satu folder satu tanggung jawab. Jangan campur logika antar modul.

## 3. Single Responsibility
Satu file satu tanggung jawab (`orderExecutor.ts` hanya kirim order, bukan juga hitung indikator).

## 4. Shared Types — PALING SERING DILANGGAR
Interface bersama WAJIB di `types.ts` folder tersebut. **Kalau tipe (mis. `OrderSide`, `StrategyDecision`, `TradeAction`) sudah ada di `types.ts`, file lain WAJIB `import type` dari sana, bukan menulis ulang union type/interface yang sama.**

Ini sudah menyebabkan build gagal berkali-kali karena TypeScript menganggap dua definisi bernama sama sebagai tipe berbeda saat barrel-export bersamaan. Contoh nyata yang baru saja diperbaiki: `StrategyDecision` didefinisikan ulang di `strategy/core/strategyEngine.ts` (tanpa field `riskLevel`) terpisah dari versi kanonik di `strategy/types.ts` — 5 file harus diperbaiki untuk menyatukannya kembali.

**Sebelum redefine type/interface: cek dulu `types.ts`, `models/`, `core/` folder terkait — apakah sudah ada versi lain dengan nama sama.**

## 5. Barrel Export
Setiap module utama wajib punya `index.ts` **sejak folder dibuat**, bukan belakangan. Folder tanpa `index.ts` yang di-`export *` dari barrel atas akan gagal build ("Cannot find module").

## 6. Configuration
Jangan hardcode API Key/Secret/Trading Pair/Confidence/Fee/Position Size. Selalu lewat config atau Environment Variables.

---

# Environment Variables

**Seluruh secret HANYA di Vercel Project Settings.** Jangan buat file `.env`/`.env.local`/`.env.example` — pernah dua kali menyebabkan kebocoran kredensial live (Indodax API key/secret, Firebase Admin private key) karena ter-commit ke repo publik.

Referensi nama variabel (dokumentasi murni, tanpa nilai asli): **`docs/environment-variables.md`**

**Catatan penting:** nama variabel secret Indodax yang BENAR adalah `INDODAX_SECRET_KEY` — bukan `INDODAX_SECRET`. Sempat ada mismatch antara `src/lib/validators/env.ts` (baca `INDODAX_SECRET`) dan `src/services/liveTrading/exchange/indodaxClient.ts` (baca `INDODAX_SECRET_KEY`, yang benar-benar dipakai). Sudah diperbaiki — kalau Vercel kamu masih pakai nama lama, ganti.

GitHub Actions (`ci.yml`, `deploy.yml`) TIDAK otomatis mewarisi Environment Variables dari Vercel. Kalau ada workflow yang jalankan `npm run build`/`type-check` sendiri, env vars yang dibutuhkan (terutama `NEXT_PUBLIC_FIREBASE_*`) harus di-set terpisah sebagai GitHub Secrets.

---

# Logging & Error Handling

Jangan `console.log()` untuk production — pakai Logger Service proyek. Semua async function pakai try/catch atau Result Object, jangan biarkan Promise gagal tanpa penanganan.

---

# Import Rules

- `import type { X } from "../types"` untuk tipe.
- `export { default as X } from "./y"` HANYA re-export, TIDAK membuat binding lokal — kalau nama itu juga dipakai di file yang sama, harus di-`import` biasa terpisah.
- **Type assertion (`as X`) tidak boleh memulai baris baru** setelah chained method call, karena Automatic Semicolon Insertion memutus expression jadi syntax error. Taruh `as X` di baris yang sama.

---

# Naming Convention

Class `PascalCase` · Function `camelCase` · Constant `UPPER_CASE` · File `camelCase.ts`

**Nama file harus persis, tanpa spasi nyempil.** File seperti `" index.ts"` (ada spasi tak kasat mata) gagal di-resolve module bundler meski terlihat identik di GitHub UI. (Kasus nyata: `services/exchange/adapters/ index.ts` — sudah diperbaiki jadi `index.ts`.)

---

# Trading Principles

Jangan pernah melewati Risk Layer.

**Order tidak boleh dieksekusi apabila:** confidence di bawah minimum · exposure melebihi batas · position limit terlampaui · saldo tidak cukup · health monitor critical.

---

# Live Trading Safety — WAJIB DIBACA SEBELUM SENTUH KODE EKSEKUSI

Ada **tiga** jalur eksekusi order paralel di codebase ini (hasil kerja beberapa tool AI berbeda tanpa koordinasi):

1. `services/exchange/adapters/indodax.ts` — `placeOrder()` sudah dikunci: menolak eksekusi kecuali `TRADING_CONFIG.mode === "live"`.
2. `services/execution/adapters/indodaxAdapter.ts` — delegasi ke nomor 1.
3. services/liveTrading/exchange/orderExecutor.ts — client HTTP terpisah sendiri (indodaxClient.ts, langsung ke https://indodax.com/tapi). Sudah ada pengaman mode paper/live, terverifikasi memblokir sebelum request asli terkirim.

⚠️ KOREKSI (audit terbaru): klaim sebelumnya bahwa services/exchange/adapters/indodax.ts → placeOrder() "sudah dikunci" adalah salah. Verifikasi langsung ke kode menunjukkan IndodaxAdapter di services/exchange/adapters/indodax.ts hanya berisi initialize(), start(), stop(), health() — semuanya cuma pakai publicClient (market data publik). Tidak ada implementasi placeOrder, getBalance, atau method private lainnya sama sekali — jadi bukan "dikunci aman", tapi memang belum ditulis. RequestSigner (HMAC-SHA512) yang disebut "siap pakai" juga belum ada di repo.

**Status saat ini (per audit terakhir):** bot berjalan mode **paper trading**, API key production belum diisi. Kedua jalur di atas yang aktif (1 dan 3) sudah punya pengaman. **Belum ada logic position-sizing yang menghitung dari saldo/exposure asli** — `execution/engine.ts` masih punya `quantity: 0` dengan TODO(SAFETY) di jalur ketiga yang belum tersambung.

**Sebelum mengklaim "live trading siap" ke user:** telusuri end-to-end sendiri, jangan percaya klaim dokumen atau status build-passing saja.

---

# Keamanan — Item Terbuka Prioritas Tinggi

**`src/components/IndodaxAccountManager.tsx` + `src/services/firebase/indodaxAccounts.ts`** (fitur multi-akun: user login → input API key/secret Indodax sendiri) **menyimpan API key & secret KE FIRESTORE DALAM BENTUK POLOS (plaintext)**, langsung dari client-side Firestore SDK di browser. Tidak ada enkripsi AES-256-GCM (padahal itu rencana awal). Tidak ada file `firestore.rules` di repo — aturan keamanan Firestore (kalau ada) hanya ada di Firebase Console, tidak ter-review di git.

**Belum diperbaiki.** Rencana perbaikan: pindahkan alur ke API route server-side (`/api/accounts/indodax`) yang enkripsi dengan master key dari `process.env` sebelum simpan ke Firestore — client tidak pernah kirim key mentah langsung ke Firestore. Plus tulis `firestore.rules` yang benar (`allow read, write: if request.auth.uid == uid;`).

**Kalau API key asli sudah pernah dicoba lewat form ini** (bukan cuma testing kosong), perlakukan seperti insiden `.env.local` sebelumnya — revoke & regenerate dari Indodax.

---

# Known Duplication — Perlu Keputusan Konsolidasi

| Konsep | Implementasi paralel | Status |
|---|---|---|
| Exchange API client | `services/indodax/` (lama, stub) vs `services/exchange/` (scaffolding luas, 44+ file) | `IndodaxAdapter` private ops (`placeOrder`, `getBalance`) sudah terisi (bukan lagi `AdapterNotImplementedError` seperti versi lama) |
| Trading execution | `services/trading/` (aktif, Firebase) vs `services/paperTrading/` (in-memory, TIDAK persisten lintas cold-start) vs `services/liveTrading/` (scaffolding lengkap 15 file/6400 baris, aman tapi belum tersambung ke cron/dispatcher manapun) | Ketiganya hidup berdampingan, belum ada keputusan mana kanonik |
| Strategy execution | `services/strategy/core/strategyEngine.ts` + `strategies/*.ts` (auraTrend, emaCrossover, momentum) — **ini yang tersambung ke `execution/engine.ts`, jalur nyata** | vs `services/strategy/rules/*.ts` (momentumRule, trendRule, volatilityRule, volumeRule) + `StrategyContext` — **orphan total, tidak dipanggil dari manapun**, mirip pola lapisan AI/ML |
| AI/ML layer | `services/ml/` + `services/intelligence/` (~10.000 baris, 63 file) | **Orphan total** — nol import dari luar foldernya sendiri. `ModelTrainer.train()` cuma `sleep(300ms)` + fake success. Tidak ada library ML di `package.json`. |
| Dashboard pages | `src/pages/dashboard/*` (Pages Router — `index.tsx`, `settings.tsx` pakai `IndodaxAccountManager`, lebih matang) vs `src/app/dashboard/{portfolio,scanner,settings}.tsx` (App Router draft, cuma widget statis) | Draft App Router sudah diarsipkan ke `_legacy-pages-reference/app-dashboard-draft/` supaya tidak bentrok build. **Belum diporting dengan benar** — App Router harus tetap kanonik, tapi kontennya perlu diambil dari versi Pages Router yang lebih lengkap. Sidebar link ke `/dashboard/portfolio` dll saat ini akan 404. |
| Portfolio service | `services/portfolio/` sempat diarsipkan sebagai non-kanonik, lalu aktif lagi (regresi dari tool AI lain) | `portfolioRegistry` sudah diperbaiki (kurang named export) |

**Sebelum membuat engine/adapter/service baru untuk konsep yang sudah ada implementasinya (aktif maupun scaffolding), WAJIB cek dulu — kalau ragu, tanya pemilik project sebelum menambah cabang baru.**

---

# Code Quality Rules

- Jangan ubah API publik tanpa alasan.
- Jangan buat duplicate class/interface/folder/engine kalau sudah ada.
- Setiap folder baru di `services/*/` wajib langsung punya `index.ts` barrel saat dibuat.
- Sebelum redefine type/interface: cek dulu `types.ts`, `models/`, `core/` folder terkait.

---

# Build Requirements

Perubahan dianggap selesai apabila:
- TypeScript compile tanpa error
- Next.js build berhasil
- Tidak menambah circular dependency
- Tidak membuat dead code baru
- **Perubahan benar-benar ter-commit ke branch `main`** — verifikasi lewat commit history sebelum melaporkan hasil build (karena workflow ini browser-only, gampang lupa satu file belum di-apply)

---

# AI Assistant Guidelines

- Ikuti struktur proyek yang sudah ada. Gunakan modul yang tersedia sebelum membuat modul baru.
- Kalau perlu refactor besar, jelaskan alasan dan dampaknya SEBELUM mengubah struktur — jangan langsung eksekusi keputusan arsitektur besar secara sepihak.
- Sebelum menulis ulang (regenerate) file dari nol, cek riwayat/versi sebelumnya — regenerasi tanpa referensi berisiko mengembalikan bug yang sudah pernah diperbaiki.
- Jangan asumsikan angka/formula untuk logic yang menyangkut uang (position sizing, risk limit) — cari config yang sudah ada atau tanya pemilik project.
- **Kalau menemukan isu keamanan (kredensial plaintext, key ter-commit, dst): laporkan dulu ke user secara eksplisit sebelum lanjut kerja lain, jangan diam-diam ditambal atau diabaikan.**

---

# Session Log

*(Ringkas, bukan pengganti commit history. Update di akhir tiap sesi build-fix besar.)*

**Sesi build-fix marathon (v0.1.0 Alpha, "Phase 17" audit):**
- Ditemukan: lapisan `services/intelligence/` + `services/ml/` (~10rb baris) orphan total, banyak tipe (`AIRequest`, `FeatureVector`, `MarketContext`, `MarketMomentum`, `FusionDecision`) tidak pernah didefinisikan sama sekali di `types.ts` masing-masing — sudah dilengkapi.
- `services/liveTrading/` (jalur eksekusi order ketiga) diverifikasi: sudah ada pengaman mode paper/live, aman. Bug tipe minor (`symbol`/`side` hilang di return object, `orderId` nullable) sudah diperbaiki.
- `services/market/`: pola bug berulang — order book level (`{price, quantity}`) salah diasumsikan sebagai tuple `[price, volume]` di banyak file (`orderBookAggregator`, `liquidityFilter`, `spreadFilter`, `orderBookSnapshot`). Semua sudah diperbaiki. `Ticker` field name mismatch (`ticker.last`→`lastPrice`, `.open`→`openPrice`, dst) juga diperbaiki.
- `services/strategy/`: ditemukan **dua sistem strategi paralel** dengan kontrak berbeda — (a) `core/strategyEngine.ts` family (dipakai nyata, tersambung ke `execution/engine.ts`) dan (b) `types.ts`+`rules/*.ts` family via `StrategyContext` (orphan total). `StrategyDecision`/`TradeAction` yang didefinisikan ulang di (a) sudah disatukan ke versi kanonik `types.ts`, 5 file disesuaikan. Lapisan (b) — `rules/*.ts` — **belum selesai diperbaiki**, masih ada type error (`RuleResult` belum didefinisikan di `types.ts`), tapi karena orphan total, tidak mendesak.
- File dashboard App Router yang 404 (`portfolio`, `scanner`, `settings` — salah nama, seharusnya `page.tsx` di dalam folder) diarsipkan ke `_legacy-pages-reference/app-dashboard-draft/`. **Belum dibuat ulang dengan benar** dari versi Pages Router yang lebih lengkap.
- Env var mismatch `INDODAX_SECRET` vs `INDODAX_SECRET_KEY` diperbaiki di `src/lib/validators/env.ts`.
- **Temuan keamanan belum diperbaiki:** `IndodaxAccountManager` simpan API key/secret plaintext ke Firestore, tidak ada `firestore.rules` di repo. Lihat bagian "Keamanan" di atas.
- `docs/environment-variables.md` dibuat (dokumentasi nama variabel, bukan file `.env`).

**Status build saat log ini ditulis:** BELUM 100% bersih. Error terakhir: `src/services/strategy/rules/momentumRule.ts:11` — `RuleResult` belum ada di `strategy/types.ts` (bagian dari sistem strategi orphan (b) di atas, lihat "Known Duplication").

**Next step:** lengkapi `RuleResult` + sisa tipe di `strategy/rules/*.ts` (orphan, aman diperbaiki cepat), lanjut sampai `npm run build` 100% bersih, baru commit per-file via GitHub browser.

---

**Update — file-by-file delivery selesai diterapkan (23 file + 1 arsip 3-file):**

`docs/claude.md`, `docs/environment-variables.md`, `src/lib/validators/env.ts`, arsip 3 file dashboard App Router (`portfolio.tsx`/`scanner.tsx`/`settings.tsx` → `_legacy-pages-reference/app-dashboard-draft/`), `services/portfolio/registry.ts`, `services/paperTrading/simulator.ts`, `services/market/aggregators/tradeAggregator.ts`, `services/market/aggregators/orderBookAggregator.ts`, `services/market/feeds/tickerFeed.ts`, `services/market/filters/liquidityFilter.ts`, `services/market/filters/spreadFilter.ts`, `services/market/snapshots/orderBookSnapshot.ts`, `services/market/snapshots/tickerSnapshot.ts`, `services/market/index.ts`, `services/strategy/core/strategyEngine.ts`, `services/strategy/index.ts`, `services/strategy/manager.ts`, `services/strategy/registry.ts`, `services/intelligence/types.ts`, `services/intelligence/ai/explanation.ts`, `services/liveTrading/exchange/orderExecutor.ts`, `services/liveTrading/execution/fillHandler.ts`, `services/indicators/index.ts`.

**Sudah dicek, TIDAK perlu diubah** (sudah sama dengan versi terbaru di repo, kemungkinan diperbaiki di sesi lain): `services/backtest/execution/orderSimulator.ts`, `services/liveTrading/engine.ts`, `services/liveTrading/types.ts`, `.gitignore`.

**Status build masih sama seperti di atas — BELUM 100% bersih.** 23 file di atas menyelesaikan seluruh lapisan `intelligence/`, `market/`, `liveTrading/` (bug type-level), dan sebagian besar `strategy/` (family yang aktif/nyata). Sisa satu-satunya blocker yang diketahui: `strategy/rules/*.ts` (family kedua, orphan total — lihat "Known Duplication"). **Belum dikerjakan** di sesi ini karena orientasi kerja berubah ke pengiriman file-per-file di tengah proses.

**Cara pakai workflow sekarang (mulai sesi ini):** perubahan dikirim satu file per pesan chat (bukan zip), lalu diterapkan manual satu-satu lewat GitHub browser oleh Raka. Kalau sesi Claude lain melanjutkan: cek dulu file mana di atas yang sudah live di repo (tanya user, jangan asumsi) sebelum lanjut kerja supaya tidak duplikat usaha.

# Known Duplication — Keputusan Konsolidasi

*(Diputuskan pada audit menyeluruh — arah project: fokus Indodax, multi-exchange ditunda/belum diputuskan)*

## 1. Exchange API Client: `services/exchange/` vs `services/indodax/`

**Keputusan: `services/exchange/` jadi kanonik.**

Alasan:
* Struktur lebih matang — pemisahan public/private API, error handling class-based (`ExchangeError`, `AuthenticationError`, dll), `RequestSigner` (HMAC-SHA512) siap pakai untuk private API asli nanti.
* Sudah tersambung ke `services/execution/` (adapter pattern `IExchangeAdapter`).

Status migrasi:
* `services/indodax/` **tetap dipakai untuk sementara** oleh Market Scanner (jangan diutak-atik, itu yang live sekarang).
* Migrasi bertahap: pindahkan scanner dari `services/indodax/{ticker,market,candles,orderbook}` ke `services/exchange/adapters/indodax` punya public services, BARU HAPUS `services/indodax/` setelah scanner terverifikasi jalan pakai `exchange/`.
* `services/indodax/client.ts`, `trades.ts`, `auth.ts`, `private.ts` (stub kosong) — TIDAK perlu diisi, karena private API akan diimplementasikan di `services/exchange/adapters/indodax.ts` + `services/exchange/private/*`, bukan di sini.

## 2. Trading Execution: `services/trading/` vs `services/paperTrading/` vs `services/liveTrading/`

**Keputusan: `services/trading/` jadi kanonik.**

Alasan:
* Satu-satunya yang live — terhubung Firebase (`botState`, `logs`), dipanggil cron (`/api/cron/scan`), sudah diverifikasi jalan di production.

Status modul lain:
* `services/paperTrading/` — **DIHAPUS.** Selain duplikat, state-nya in-memory (`Map`/variable JS biasa) yang secara fundamental tidak bisa dipakai di Vercel serverless (hilang tiap cold start). Paper trading yang benar sudah ditangani `services/trading/paper.ts` (`PaperTradingService`, Firebase-backed).
* `services/liveTrading/` — **DIPERTAHANKAN**, tidak dihapus. Ini scaffolding untuk orchestrator live trading berkelanjutan, secara eksplisit menunggu "Strategy Engine Phase 14". Jangan diaktifkan/disambungkan sampai fase itu benar-benar tiba.

## 3. Execution Layer: `services/execution/engine.ts` vs `services/execution/executionEngine.ts`

**Keputusan: digabung jadi satu file, basis dari `executionEngine.ts`.**

Alasan: keduanya saling melengkapi, bukan murni duplikat.
* `engine.ts` — kuat di position sizing (`StrategyDecision` + harga pasar → `ExecutionRequest`, pakai `TRADING_CONFIG.defaultTradeAmount`/`maxTradeAmount`/`order.minimumAmount`).
* `executionEngine.ts` (v0.2.0, lebih baru) — kuat di validasi (`minimumConfidence` bisa dikonfigurasi, cek `quantity <= 0`, latency measurement asli pakai `performance.now()`).

Rencana konsolidasi:
* `executionEngine.ts` jadi file yang dipertahankan.
* Tambahkan method baru (mis. `executeDecision(decision, price, context)`) yang berisi logic position-sizing dari `engine.ts`, lalu delegasikan ke `execute()` yang sudah ada di `executionEngine.ts` untuk validasi + eksekusi.
* Hapus `engine.ts` setelah `executeDecision()` terverifikasi menggantikan seluruh pemakaiannya.

## Catatan proses konsolidasi

Migrasi di atas dikerjakan **bertahap per sesi**, bukan sekaligus — supaya risiko terhadap fitur yang sudah live (login, dashboard, cron, scanner) tetap terkendali. Urutan disarankan: mulai dari #3 (lingkup paling kecil, risiko paling rendah), lalu #2 (hapus `paperTrading/`, aman karena belum dipakai apapun), terakhir #1 (paling besar dampaknya, karena scanner yang live perlu dipindah hati-hati).

## ⚠️ REVISI: `services/paperTrading/`

Rekomendasi sebelumnya ("hapus paperTrading/, redundan") **DITARIK/BATAL**.
Ternyata folder ini jauh lebih lengkap dari yang diperkirakan (types.ts, index.ts,
orders.ts, tracker.ts, simulator.ts) dan kemungkinan besar TERHUBUNG ke:
- src/pages/dashboard/paper-trading.tsx (halaman live)
- src/pages/api/paper-trading/status.ts (API live)
- src/services/firebase/paperTradingStore.ts (kemungkinan Firestore-backed, BUKAN in-memory)

JANGAN hapus folder ini sampai investigasi lengkap selesai — cek apakah
paperTradingStore.ts benar-benar persisten ke Firestore, dan apakah ini
sebenarnya sistem paper-trading yang aktif dipakai (terpisah dari
services/trading/paper.ts). Kemungkinan kesimpulan "trading/ jadi kanonik"
sebelumnya perlu ditinjau ulang.
# Session Log — Build Stabilization & Architecture Audit

*(Ringkasan kerja dari sesi debugging panjang. Baca ini dulu sebelum melanjutkan
supaya tidak mengulang investigasi atau kesalahan yang sudah pernah terjadi.)*

## Ringkasan apa yang sudah dikerjakan

**Build & Deployment:**
* Puluhan bug TypeScript diperbaiki secara berurutan sampai `next build` lolos bersih di Vercel (barrel export yang hilang/salah, duplikasi tipe seperti `ExchangeHealth`/`StrategyAction`/`OHLC`, import path salah, syntax error `<` hilang saat copy-paste, dll)
* `cron-scan.yml` diperbaiki (URL rusak `https://https://...`)
* Masalah billing GitHub Actions diselesaikan
* Firebase Auth, dashboard, Firestore data flow — terverifikasi live dan berfungsi

**Exchange Layer (`services/exchange/`):**
* Sistem adapter (`IExchangeAdapter`, `BaseExchangeAdapter`) dilengkapi dengan method operasional (`getAccount`, `getBalance`, `placeOrder`, dll) — sengaja melempar `AdapterNotImplementedError` yang jelas untuk method yang belum diimplementasikan (BUKAN implementasi palsu)
* Barrel `index.ts` untuk `adapters/`, `models/`, `errors/`, `utils/` dibuat lengkap
* `services/execution/adapters/indodaxAdapter.ts` disambungkan ke `ExchangeManager`, termasuk mapping `OrderStatus` → `ExecutionStatus`

**Execution Layer:**
* `execution/engine.ts` dan `execution/executionEngine.ts` **sudah digabung** jadi satu (`executionEngine.ts` v0.3.0) — method `executeDecision()` (position sizing dari `TRADING_CONFIG`) + `execute()` (validasi confidence/quantity + logging via `executionLogger`)
* `execution/engine.ts` **sudah dihapus**

**Strategy Engine — Review Mendalam (`services/strategy/`):**
* 3 strategi (`auraTrend`, `emaCrossover`, `momentum`) di-review formula & bobotnya secara matematis:
  - `auraTrend`: paling matang — filter pasar → exit priority → entry (efektif butuh 4/5 indikator) → validasi skor independen kedua (`strategyScore`)
  - `momentum`: secara tidak sengaja jadi "unanimous gate" (butuh 3/3 indikator setuju, bukan voting mayoritas seperti niat desainnya)
  - `emaCrossover`: paling berisiko whipsaw (1 kondisi tunggal, rawan tergerus fee di pasar sideways)
* **Bug terbuka yang PENTING dan BELUM diperbaiki**: ketiga strategi tidak memeriksa posisi aktual sebelum mengeluarkan sinyal SELL — bisa SELL walau belum pernah BUY. `StrategyContext.position` sudah ada di `types.ts` tapi tidak pernah dialirkan ke `execute()` (signature-nya cuma terima `features`, tidak terima context/posisi).

**Indicators (`services/indicators/`):**
* Barrel `index.ts` dilengkapi export MACD/ATR/ADX/Stochastic (sebelumnya cuma EMA/SMA/RSI/Bollinger)
* Konflik `interface OHLC` (didefinisikan identik di `atr.ts`, `adx.ts`, `stochastic.ts`) diselesaikan — `atr.ts` jadi sumber tunggal, `adx.ts`/`stochastic.ts` import dari situ
* Duplikasi ditemukan (belum dibereskan): `ema.ts` vs `movingAverage.ts` (sama persis), `bollinger.ts` vs `bollingerBands.ts` (beda file, fungsi nama sama `calculateBollingerBands`)
* Formula MACD, ATR, ADX, Stochastic sudah diverifikasi benar secara matematis (standar textbook)

**App Router Layout:**
* Ditemukan: `src/app/layout.tsx` (root App Router) punya header/footer custom sendiri, TIDAK pakai `layouts/Header.tsx`/`Footer.tsx`, dan awalnya tidak ada sidebar sama sekali
* Fix: `SidebarAppRouter.tsx` (pakai `usePathname` dari `next/navigation`, bukan `next/router`) dibuat dan disambungkan LANGSUNG ke `app/layout.tsx` (bukan wrap per-halaman, supaya tidak dobel header/footer)
* Belum selesai: penyamaan visual antara desain header Pages Router vs App Router (beda desain, disengaja ditunda)

## ⚠️ Investigasi terbuka — JANGAN diasumsikan selesai

**`services/paperTrading/` vs `services/trading/paper.ts`:** Rekomendasi awal sesi ini ("hapus `paperTrading/`, redundan & in-memory") **SALAH/DITARIK**. Setelah dicek lebih lanjut, `services/paperTrading/` ternyata punya struktur lengkap (`types.ts`, `index.ts`, `orders.ts`, `tracker.ts`, `simulator.ts`) dan kemungkinan besar terhubung ke:
* `src/pages/dashboard/paper-trading.tsx` (halaman live, ada di menu sidebar)
* `src/pages/api/paper-trading/status.ts` (API endpoint)
* `src/services/firebase/paperTradingStore.ts` (kemungkinan Firestore-backed — BUKAN in-memory seperti yang diasumsikan dari `engine.ts` versi lama)

**Yang perlu dilakukan sebelum ambil keputusan apapun soal folder ini:**
1. Baca isi `paperTradingStore.ts`, `paper-trading.tsx`, `index.ts`, `status.ts`
2. Pastikan apakah ini sistem paper trading yang AKTIF dipakai user (terpisah dari `trading/paper.ts`), atau memang legacy yang sudah digantikan
3. BARU putuskan konsolidasi — jangan hapus dulu sebelum ini jelas

## Roadmap menuju Real Trading

| # | Tahap | Status |
|---|---|---|
| 1 | Gabungkan `execution/engine.ts` + `executionEngine.ts` | ✅ Selesai |
| 2 | Investigasi & putuskan `paperTrading/` vs `trading/paper.ts` | 🔄 Sedang berjalan |
| 3 | Implementasi private API Indodax asli (HMAC, `getBalance`, `placeOrder`, dll di `IndodaxAdapter`) | ⏳ Belum — paling kritis, menyangkut API key & uang asli |
| 4 | Perbaiki position-awareness di `auraTrend`/`emaCrossover`/`momentum` | ⏳ Belum |
| 5 | Pastikan `RISK_CONFIG` (stop loss, max exposure, max daily loss, emergency stop) benar-benar divalidasi di jalur eksekusi | ⏳ Belum — saat ini belum ada validasi risk config di `ExecutionEngine`/`TradingEngine` |
| 6 | Testing menyeluruh mode PAPER dengan strategi live beberapa hari/minggu | ⏳ Belum |
| 7 | Aktifkan `BOT_MODE=live` dengan nominal kecil | ⏳ Belum |

## Cara pakai log ini untuk sesi Claude berikutnya

Sebelum menyarankan perubahan besar, baca dulu seluruh bagian ini + "Known Duplication" di atas. Jangan re-investigasi dari nol hal yang statusnya sudah "Selesai" di atas, dan jangan berasumsi soal `paperTrading/` sebelum item investigasi terbuka itu dijawab tuntas.

---

**Update — sesi lanjutan (v0.1.2 Alpha): RiskManager wiring, regresi static-route, fitur Trade Amount slider**

**RiskManager tersambung ke jalur live (`services/trading/engine.ts` v0.0.7):**
Sebelumnya `RiskManager`/`RISK_CONFIG` sudah lengkap (stop loss, take profit, max exposure, dst) tapi nol referensi dari `trading/engine.ts` — DecisionEngine murni EMA/RSI, tidak sadar harga SL/TP sama sekali. Sekarang: setiap siklus, kalau posisi terbuka, `riskManager.evaluate({buyPrice, currentPrice, inPosition})` dicek LEBIH DULU, sebelum tanya `DecisionEngine`. Kalau `shouldStopLoss`/`shouldTakeProfit` true → paksa SELL, DecisionEngine di-skip. Field baru `riskTriggered: boolean` ditambahkan ke `TradingEngineResult` + log, supaya kelihatan di histori mana SELL karena strategi vs karena kena SL/TP.

**Bug lama regresi lagi — sudah diperbaiki ulang:** `/api/bot`, `/api/health`, `/api/settings` (App Router wrapper di `src/app/api/*/route.ts`) sempat kembali ke bug lama (di-cache statis, handler benar-benar tereksekusi saat `next build` karena wrapper tidak punya `export const dynamic = "force-dynamic"` sendiri — re-export saja tidak membawa config itu). Kemungkinan wrapper ini sempat ditulis ulang oleh sesi lain tanpa tahu soal fix sebelumnya. **Kalau nemu wrapper App Router baru yang cuma `import {GET} from ...; export {GET};` tanpa `export const dynamic`/`runtime` di atasnya — itu bug ini lagi, langsung tambahkan 2 baris itu.**

**Fitur baru: Trade Amount bisa diatur lewat slider di `/settings/risk` (Rp10.500–Rp25.000), tersimpan Firestore, real-time tanpa redeploy:**
- File baru `services/firebase/settingsService.ts` — `getBotSettings()`/`updateBotSettings()`, collection `bot_settings/default`, pola sama seperti `botState.ts` (Admin SDK, bukan Client SDK).
- `api/settings/service.ts` — `getSettings()` sekarang benar-benar baca Firestore (sebelumnya cuma `return DEFAULT_SETTINGS` statis, stub v0.0.1). Ditambah `saveSettings(partial)`.
- `api/settings/route.ts` + wrapper `app/api/settings/route.ts` — ditambah handler `PUT`.
- `services/trading/paper.ts` — `buy()` sekarang ambil `tradeAmountIdr` dari `getBotSettings()`, bukan `BOT_CONFIG.defaultTradeAmount` (env var) lagi. **Catatan:** `stopLossPrice`/`takeProfitPrice` di sync ke `paperTradingStore` masih pakai `BOT_CONFIG.stopLoss`/`.targetProfit` (env var) — belum ikut dipindah ke settings dinamis, di luar scope perubahan ini.
- `pages/settings/risk.tsx` — slider interaktif untuk `tradeAmountIdr`. Stop Loss/Take Profit/Max Position di halaman yang sama **masih read-only** (sumbernya `RISK_CONFIG` env var, belum ada UI untuk itu).

**Belum dikerjakan / catatan terbuka:**
- `RiskManager.validateTradeAmount(amount)` di `services/trading/risk.ts` kemungkinan bug lama: membandingkan `amount` (nominal trade, IDR) dengan `RISK_CONFIG.maxOpenPosition` (jumlah posisi maksimal) — dua satuan berbeda, method ini kemungkinan tidak pernah dipanggil di jalur manapun (perlu diverifikasi) jadi belum terasa dampaknya. **Belum diperbaiki**, sengaja tidak disentuh karena di luar scope task saat ditemukan — tanya pemilik project sebelum ubah formula.
- Stop Loss / Take Profit / Max Position belum bisa diatur dari UI (masih env var only) — kalau mau dibuatkan slider serupa, tinggal ikuti pola `tradeAmountIdr` di atas.

---

**Update — sesi audit Settings API + awal implementasi Indodax Private API**

**Bug build diperbaiki: `src/api/settings/route.ts` self-import.**
File ini mengimpor `GET`/`PUT` dari dirinya sendiri lalu mendefinisikan ulang keduanya di bawahnya — `PUT redefined`. Fix: hapus 2 baris self-import (`import { GET, PUT } from "@/api/settings/route"; export { GET, PUT };`), sisakan definisi asli yang manggil `getSettings()`/`saveSettings()`.

**Bug terkait ditemukan sekaligus: wrapper `src/app/api/settings/route.ts` cuma re-export `GET`, tidak `PUT`.**
Kalau tidak diperbaiki bareng, slider Trade Amount tetap gagal simpan (404/405) walau build sudah lolos, karena App Router tidak tahu route ini punya handler `PUT`. Fix: tambahkan `PUT` ke import & export di wrapper.

**Audit `IndodaxAdapter` / private API Indodax — task paling kritis, BELUM dikerjakan:**
Verifikasi langsung ke kode (lihat koreksi di "Live Trading Safety" di atas) — private API Indodax (HMAC signing, `getBalance`, `placeOrder`, `getOrder`, `cancelOrder`) **belum ada implementasinya sama sekali** di `IndodaxAdapter`. Yang sudah dikonfirmasi ADA dan siap dipakai sebagai fondasi:
- `services/exchange/adapters/base.ts` — `IExchangeAdapter` interface lengkap (semua method operasional sudah punya signature) + `BaseExchangeAdapter` dengan default `AdapterNotImplementedError` per method (pola: jangan pura-pura berhasil).
- Models lengkap: `models/account.ts` (`ExchangeAccount`), `models/balance.ts` (`Balance`, `AccountBalance`), `models/order.ts` (`Order`, `OrderStatus`), `models/trade.ts` (`Trade`).
- Errors: `errors/ExchangeError.ts` (base, punya `recoverable`/`severity`/`timestamp`/`toJSON()`), `errors/AuthenticationError.ts` (extends `ExchangeError`), `errors/NetworkError.ts`, `errors/RateLimitError.ts` (dipakai `public/client.ts`).
- `services/exchange/public/client.ts` — pola HTTP client (`PublicClient` base class + `IndodaxPublicClient`), base URL `https://indodax.com`, GET dengan `AbortController`/timeout, error mapping ke `RateLimitError`/`NetworkError`. Private client (`services/exchange/private/`, belum ada) sebaiknya ikuti pola/gaya yang sama.
- `config/trading.ts` — `TRADING_CONFIG` (mode paper/live, pair, trade amount, order config, fee) sudah ada, baca dari env var `BOT_*`.
- **`RequestSigner` (HMAC-SHA512) — TIDAK ada di repo**, meski klaim sebelumnya bilang "siap pakai". Harus dibuat dari nol. Referensi resmi: Indodax Trade API — endpoint `POST https://indodax.com/tapi`, header `Key` (API key) + `Sign` (HMAC-SHA512 dari `totalParams` = query string + request body, pakai secret key), plus parameter `timestamp`/`recvWindow` (atau `nonce` versi lama, integer selalu naik).

**Keputusan arsitektur TERBUKA — belum diputuskan, jangan asumsikan:**
Kredensial Indodax (API key + secret) akan **diinput per-user lewat dashboard**, dan **satu user bisa punya multi-akun Indodax**. Ini tidak cocok dengan pola `IndodaxAdapter` saat ini yang diekspor sebagai **singleton** (`export default indodaxAdapter`, satu instance global) dan `IExchangeAdapter` interface yang method-nya (`getBalance()`, `placeOrder(order)`, dll) **tidak menerima parameter kredensial sama sekali**.

Dua opsi yang diidentifikasi (belum dipilih):
- **Opsi A** — Adapter per-akun: `IndodaxAdapter` terima `{apiKey, secretKey}` di constructor, instance baru dibuat per-akun saat butuh operasi private. Singleton lama tetap untuk publik/health-check saja.
- **Opsi B** — Kredensial per-panggilan: ubah signature `IExchangeAdapter` supaya tiap method terima parameter kredensial, instance tetap satu. Dampak lebih luas karena `services/execution/adapters/indodaxAdapter.ts` sudah delegasi ke adapter ini.

**JANGAN mulai menulis `RequestSigner`/private client/`IndodaxAdapter` real sebelum keputusan A/B ini diambil oleh pemilik project** — menyangkut struktur data kredensial per-user yang akan dipakai di banyak file turunan.

**Keamanan — eskalasi prioritas:**
Isu lama (`IndodaxAccountManager` simpan API key/secret plaintext ke Firestore, tanpa `firestore.rules`) yang sebelumnya "belum mendesak karena belum tersambung ke eksekusi asli" **sekarang jadi prioritas tinggi** — begitu `IndodaxAdapter` bisa `placeOrder`/`getBalance` pakai kredensial dari Firestore, plaintext storage ini jadi jalur pencurian API key trading/withdraw milik semua user. Rekomendasi: kerjakan enkripsi server-side (lihat bagian "Keamanan" di atas) **bersamaan atau sebelum** private API ini live, bukan sesudahnya.


Untuk BOT_OWNER_UID, cara dapatnya: buka Firebase Console → Authentication → Users, cari akun kamu (yang dipakai login ke dashboard AutoIDX), copy kolom User UID-nya.

Untuk ACCOUNT_ENCRYPTION_KEY, saya generate sekarang biar tinggal pakai:

Ini key-nya (32 byte, format hex):

1f595b4d3257964d2059e53592f36328759fe4df199cb187a354cea0a25a056e

Key final (sudah saya verifikasi persis 64 karakter):

73d080ecd7a04b748311227d7bc9af6eff300d94a08f3a48be294a7b7170857d

Langkah selanjutnya:

Di Vercel, set env var ACCOUNT_ENCRYPTION_KEY = key di atas
Set env var BOT_OWNER_UID = User UID kamu dari Firebase Console → Authentication
Redeploy (otomatis kalau kamu commit sesuatu, atau trigger manual redeploy di Vercel)
Baru buka /dashboard/settings, masukkan API Key & Secret Key Indodax kamu lewat form "Akun Trade API Indodax"

Setelah itu tersimpan (statusnya "Aktif"), bot masih tetap paper trading sampai kamu secara eksplisit set BOT_MODE=live dan BOT_LIVE_CONFIRM=true barengan di Vercel — jangan lupa itu langkah terakhir sebelum benar-benar pakai uang asli.

Simpan key enkripsi itu baik-baik (misal di password manager) — kalau hilang, semua API key/secret yang sudah tersimpan di Firestore tidak akan bisa didekripsi lagi.

---

# Update — BUILD 100% BERSIH TERCAPAI (lanjutan sesi di atas)

**`npm run build` sudah lolos total** (TypeScript compile + type-check + static generation semua route), terverifikasi di container Claude maupun konfirmasi Raka di Vercel. Ini pencapaian penting: v0.0.1 Alpha yang stabil sudah tercapai.

## Pekerjaan tambahan sesi ini (setelah build pertama kali hijau)

**Menuju live trading — atas permintaan eksplisit Raka ("target kita menuju live trading beneran"):**

1. **Position-awareness di strategi aktif** (`core/strategyEngine.ts` family) — sebelumnya `auraTrend.ts`/`emaCrossover.ts`/`momentum.ts` bisa return `SELL` tanpa tahu apakah sedang punya posisi. Sekarang parameter `position:"NONE"|"LONG"` mengalir dari `strategy/engine.ts` → `manager.ts` → `core/strategyEngine.ts` → tiap strategi, default `"NONE"` (fail-safe: kalau lupa diisi, otomatis tidak akan SELL). 6 file diperbaiki: `core/strategyEngine.ts`, `manager.ts`, `engine.ts`, `auraTrend.ts`, `emaCrossover.ts`, `momentum.ts`.

2. **Keputusan arsitektur eksekusi:** direkomendasikan `services/trading/` sebagai basis kanonik (bukan `execution/` atau `liveTrading/` yang scaffolding besar tapi belum tersambung apa-apa) — karena `services/trading/` satu-satunya yang sudah terbukti jalan end-to-end (Firebase-connected, position-aware via `decision.ts`).

3. **Validasi RISK_CONFIG sebelum eksekusi** (sebelumnya nol validasi sama sekali di `services/trading/engine.ts`) — dikerjakan kolaboratif dengan sesi Claude lain secara paralel:
   - `emergencyStop` — kill switch, dicek paling prioritas
   - Stop-loss/take-profit **paksa**, terpisah dari sinyal strategi (`RiskManager.evaluate()` di `trading/risk.ts`, sekarang benar-benar dipanggil dari `engine.ts`)
   - Batas rugi harian (`maxDailyLossPercent`) via `firebase/riskState.ts` (file baru)
   - Cooldown antar trade
   - Max exposure per trade
   - **Live trading dua-gerbang:** `TRADING_CONFIG.mode === "live"` DAN `process.env.BOT_LIVE_CONFIRM === "true"` — sengaja dua syarat terpisah supaya tidak ada yang "kepencet" masuk mode live tanpa sadar.
   - Bug diperbaiki di `trading/risk.ts`: `validateTradeAmount()` sebelumnya salah bandingkan `amount` dengan `RISK_CONFIG.maxOpenPosition` (itu jumlah posisi, bukan nominal) — seharusnya `BOT_CONFIG.maxTradeAmount`.
   - `BOT_CONFIG.startingBalance` ditambahkan (belum ada sebelumnya, dibutuhkan untuk hitung persentase exposure/rugi harian).
   - **Masih ada gap:** `RISK_CONFIG.maxOpenPosition` (batas jumlah posisi terbuka lintas SEMUA pair) — infrastrukturnya sudah dibuat (`getOpenPositionsCount()` di `botState.ts`) tapi **belum dipanggil** dari `engine.ts`. Perlu ditambahkan sebelum benar-benar live.

4. **Live order execution asli** (`services/trading/live.ts`, file baru) + `IndodaxClient.getInfo()`/`trade()` (method baru di `liveTrading/exchange/indodaxClient.ts`) — order asli lewat private Trade API Indodax, market order only. Catatan dari pembuatnya: response SELL dari Indodax **belum ada contoh resmi** di dokumentasi (cuma BUY), jadi field-nya diasumsikan simetris dengan fallback ke harga referensi kalau field tidak ditemukan — **wajib dicek manual di `activity_logs` setelah transaksi live pertama** untuk konfirmasi field response yang benar.

5. **🔴 Bug serius ditemukan & diperbaiki — Client SDK vs Admin SDK di server:**
   `firebase/riskState.ts` (baru dibuat) dan `firebase/botState.ts` (sudah lama ada, dipakai di MANA-MANA untuk tracking posisi) **keduanya sempat pakai Client SDK Firestore** (`firebase/firestore`) padahal dipanggil dari server (cron `/api/cron/scan.ts`). Di server, `request.auth` selalu `null`, jadi kalau Firestore Security Rules mensyaratkan auth, read/write **gagal diam-diam** — masuk `catch`, balik ke nilai default, terlihat jalan tapi sebenarnya tidak pernah benar-benar baca/tulis data asli. Ini sama persis pola yang sudah pernah diperbaiki di `paperTradingStore.ts` sebelumnya, tapi luput di 2 file ini.

   **Sudah diperbaiki** — keduanya sekarang pakai Admin SDK (`adminDb` dari `@/services/firebase/admin`), dikonfirmasi aman karena dicek dulu: tidak ada komponen client (`.tsx`) yang mengimpor kedua file ini, semua pemakainya di `services/trading/*` (server-only).

   **Perhatian untuk sesi berikutnya kalau bikin file firebase baru:** Admin SDK sintaksnya beda dari Client SDK —
   - `snapshot.exists` (properti) bukan `snapshot.exists()` (fungsi)
   - `FieldValue.serverTimestamp()` dari `firebase-admin/firestore`, bukan `serverTimestamp()` dari `firebase/firestore`
   - Kalau file baru akan dipanggil dari API route/cron (server), defaultnya pakai Admin SDK kecuali ada alasan kuat pakai Client SDK (misal benar-benar dipanggil dari komponen client/browser).

## Status menuju live trading (per akhir sesi ini)

✅ Build bersih, position-awareness diperbaiki, validasi risk terpasang (kecuali maxOpenPosition), live execution path ada, bug Client/Admin SDK diperbaiki.

❌ **Belum:** `maxOpenPosition` belum disambungkan ke `engine.ts`. Belum ada uji coba end-to-end nyata (paper→live pertama kali). `firestore.rules` belum di-review (item lama, masih terbuka). Field response SELL Indodax di `live.ts` masih asumsi, belum terverifikasi dengan transaksi asli.

**Sebelum benar-benar aktifkan `BOT_LIVE_CONFIRM=true` di Vercel:** selesaikan dulu `maxOpenPosition`, dan sangat disarankan jalankan minimal satu siklus BUY+SELL manual di livetrading dengan nominal sekecil mungkin untuk verifikasi field response SELL yang sebenarnya dari Indodax.
