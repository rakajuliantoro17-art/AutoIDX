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
3. `services/liveTrading/exchange/orderExecutor.ts` — client HTTP terpisah sendiri (`indodaxClient.ts`, langsung ke `https://indodax.com/tapi`). **Sudah ada pengaman mode paper/live juga**, terverifikasi memblokir sebelum request asli terkirim.

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
