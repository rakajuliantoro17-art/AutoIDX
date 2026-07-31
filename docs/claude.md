# Claude Development Guide

**Project:** AURA Trade OS

**Version:** 0.1.2 Alpha

---

# Project Overview

AURA Trade OS adalah platform trading cryptocurrency berbasis TypeScript yang dibangun untuk exchange Indodax.

Tujuan utama proyek:

* Realtime Market Engine
* Technical Indicator Engine
* Strategy Engine
* Backtesting
* Paper Trading
* Live Trading
* AI Assisted Trading
* Dashboard Monitoring

Target deployment:

* GitHub
* Vercel
* Firebase

---

# Technology Stack

Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend

* Vercel Functions

Database

* Firebase Firestore

Realtime

* Indodax WebSocket

Deployment

* Vercel

---

# Project Architecture

```text
Market

↓

Indicators

↓

Strategy

↓

Risk

↓

Execution

↓

Portfolio

↓

Dashboard
```

---

# Development Principles

Semua kode baru harus mengikuti prinsip berikut.

## 1. TypeScript First

* Jangan menggunakan JavaScript.
* Gunakan typing yang jelas.
* Hindari `any` kecuali benar-benar diperlukan.

---

## 2. Modular Architecture

Setiap folder hanya memiliki satu tanggung jawab.

Contoh:

```text
indicator/

strategy/

market/

backtest/

liveTrading/

paperTrading/
```

Jangan mencampurkan logika antar modul.

---

## 3. Single Responsibility

Satu file memiliki satu tanggung jawab.

Contoh:

Benar:

```text
orderExecutor.ts
```

hanya mengirim order.

Salah:

```text
orderExecutor.ts
```

menghitung indikator sekaligus mengirim order.

---

## 4. Shared Types

Interface bersama harus ditempatkan pada:

```text
types.ts
```

Jangan mendefinisikan ulang interface yang sama di banyak file.

**Kalau sebuah tipe (mis. `OrderSide`, `PositionSide`) sudah ada di `types.ts` folder tersebut, file lain WAJIB `import type` dari sana, bukan menulis ulang union type yang sama.** Ini pernah menyebabkan build gagal berkali-kali karena TypeScript menganggap dua definisi dengan nama sama sebagai konflik ambigu saat di-barrel-export bersamaan.

---

## 5. Barrel Export

Setiap module utama harus memiliki:

```text
index.ts
```

untuk public export.

**Barrel `index.ts` harus dibuat BERSAMAAN saat folder baru dibuat, bukan belakangan.** Folder tanpa `index.ts` yang di-`export * from` dari barrel level atas akan langsung gagal build ("Cannot find module").

---

## 6. Configuration

Jangan melakukan hardcode:

* API Key
* Secret
* Trading Pair
* Confidence
* Fee
* Position Size

Gunakan configuration atau Environment Variables.

---

# Environment Variables

Seluruh secret berasal dari:

Vercel Project Settings

Jangan membuat file:

```text
.env
```

atau

```text
.env.example
```

Referensi konfigurasi:

```text
docs/vercel/environment-variables.md
```

**Catatan:** GitHub Actions (`ci.yml`, `deploy.yml`) TIDAK otomatis mewarisi Environment Variables dari Vercel. Kalau ada workflow yang menjalankan `npm run build`/`type-check` sendiri (bukan lewat `vercel build`), env vars yang dibutuhkan (terutama `NEXT_PUBLIC_FIREBASE_*`) harus di-set terpisah juga sebagai GitHub Secrets.

---

# Logging

Jangan menggunakan:

```ts
console.log()
```

untuk production.

Gunakan Logger Service proyek.

---

# Error Handling

Semua asynchronous function harus menggunakan:

* try/catch

atau

* Result Object

Jangan membiarkan Promise gagal tanpa penanganan.

---

# Import Rules

Gunakan import yang konsisten.

Contoh:

```ts
import type { LiveOrder } from "../types";
```

Gunakan `import type` untuk tipe.

**`export { default as X } from "./y"` HANYA membuat re-export, TIDAK membuat binding lokal.** Kalau nama itu juga mau dipakai di dalam file yang sama, harus di-`import` biasa juga secara terpisah.

**Type assertion (`as X`) tidak boleh memulai baris baru** setelah chained method call (`.toFixed()`, dst) karena Automatic Semicolon Insertion akan memutus expression-nya jadi syntax error. Taruh `as X` di baris yang sama dengan ekspresi yang di-assert.

---

# Folder Convention

```text
services/

api/

auth/

market/

indicator/

strategy/

backtest/

paperTrading/

liveTrading/

database/

logger/

utils/
```

---

# Naming Convention

Class

```text
PascalCase
```

Contoh

```text
RiskManager
```

Function

```text
camelCase
```

Contoh

```text
calculateExposure()
```

Constant

```text
UPPER_CASE
```

Contoh

```text
MAX_POSITION_PERCENT
```

File

```text
camelCase.ts
```

Contoh

```text
riskManager.ts
```

**Nama file harus persis, tanpa spasi nyempil di awal/akhir.** File dengan nama seperti `" index.ts"` (ada spasi) akan gagal di-resolve oleh module bundler meskipun terlihat identik di file browser.

---

# Trading Principles

Semua keputusan trading mengikuti alur:

```text
Market

↓

Indicator

↓

Strategy

↓

Risk

↓

Execution
```

Jangan melewati Risk Layer.

---

# Risk Rules

Order tidak boleh dieksekusi apabila:

* confidence di bawah minimum
* exposure melebihi batas
* position limit terlampaui
* saldo tidak cukup
* health monitor critical

---

# Current Project Status

*(Diperbarui setelah audit menyeluruh — lihat juga bagian "Known Duplication" di bawah)*

Berfungsi & terverifikasi live:

* Firebase Auth (login dashboard)
* Firestore data flow (dashboard baca data realtime)
* Market Scanner (`services/scanner/`)
* Cron trigger via GitHub Actions → `/api/cron/scan`
* Trading Engine dasar (`services/trading/engine.ts`) — BUY/SELL/HOLD per pair, tersambung Firebase (`botState`, `logs`)

Scaffolding, ada tapi BELUM terhubung ke fitur nyata:

* `services/exchange/` — sistem adapter multi-exchange generik (44+ file). `IndodaxAdapter` untuk operasi privat (`placeOrder`, `getBalance`, dst) masih melempar `AdapterNotImplementedError` secara sengaja — belum ada implementasi HMAC/private API asli.
* `services/liveTrading/engine.ts` — orchestrator loop kontinu, secara eksplisit menunggu "Strategy Engine Phase 14"
* `services/paperTrading/engine.ts` — simulasi in-memory, TIDAK persisten (state hilang tiap cold start serverless)
* `services/execution/` — `ExecutionEngine` sudah tersambung ke `ExecutionAdapter`, tapi position sizing baru pakai `TRADING_CONFIG.defaultTradeAmount`, BELUM memperhitungkan `RISK_CONFIG.maxExposurePercent` (butuh data balance akun yang belum dialirkan ke layer ini)

Belum diimplementasikan sama sekali:

* Private API Indodax asli (order execution, balance real) — `src/services/indodax/client.ts`, `trades.ts`, `auth.ts`, `private.ts`, dan padanannya di `exchange/` semua masih stub kosong atau melempar error eksplisit

---

# Known Duplication — Perlu Keputusan Konsolidasi

Project ini punya kecenderungan membuat modul/folder baru untuk konsep yang sama sebelum yang lama selesai/terhubung. Sudah ditemukan:

| Konsep | Implementasi paralel |
|---|---|
| Exchange API client | `services/indodax/` (lama, stub) vs `services/exchange/` (baru, scaffolding luas) |
| Trading execution | `services/trading/` (aktif, Firebase) vs `services/paperTrading/` (in-memory) vs `services/liveTrading/` (scaffolding, nunggu Phase 14) |

**Sebelum membuat engine/adapter/service baru untuk konsep yang sudah punya implementasi (aktif maupun scaffolding), WAJIB cek dulu apakah sudah ada — dan kalau ada, lanjutkan/perbaiki yang sudah ada, jangan buat paralel baru.** Kalau ragu implementasi mana yang "asli", tanyakan ke pemilik project sebelum menambah cabang baru.

---

# Code Quality Rules

Ketika mengubah kode:

* jangan mengubah API publik tanpa alasan
* jangan membuat duplicate class
* jangan membuat duplicate interface
* jangan membuat duplicate folder
* jangan membuat engine baru jika sudah ada
* gunakan struktur yang telah ada
* **setiap folder baru di `services/*/` WAJIB langsung punya `index.ts` barrel saat dibuat**
* **sebelum redefine sebuah type/interface, cek dulu apakah sudah ada versi lain dengan nama sama di file/folder terkait (types.ts, models/, core/)**

---

# Build Requirements

Perubahan dianggap selesai apabila:

* TypeScript compile tanpa error
* Next.js build berhasil
* Tidak menambah circular dependency
* Tidak membuat dead code baru
* **Perubahan sudah benar-benar ter-commit ke branch `main`** (bukan cuma tersimpan di editor) — verifikasi lewat commit history sebelum melaporkan hasil build

---

# AI Assistant Guidelines

Saat menghasilkan kode:

* Ikuti struktur proyek yang sudah ada.
* Gunakan modul yang telah tersedia sebelum membuat modul baru.
* Hindari duplikasi implementasi.
* Pertahankan kompatibilitas dengan arsitektur AURA Trade OS.
* Jika perlu melakukan refactor besar, jelaskan alasan dan dampaknya sebelum mengubah struktur proyek.
* **Sebelum menulis ulang (regenerate) sebuah file dari nol, cek dulu riwayat/versi sebelumnya kalau tersedia — regenerasi tanpa referensi berisiko mengembalikan bug yang sudah pernah diperbaiki.**
* **Jangan asumsikan angka/formula untuk logic yang menyangkut uang (position sizing, risk limit, dst) — selalu cari konfigurasi yang sudah ada (`config/risk.ts`, `config/trading.ts`) atau tanyakan ke pemilik project.**
