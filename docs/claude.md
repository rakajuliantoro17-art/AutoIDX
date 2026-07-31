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

**Catatan:** GitHub Actions (
