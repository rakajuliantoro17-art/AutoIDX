# Claude Development Guide

**Project:** AURA Trade OS

**Version:** 0.1.0 Alpha

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

---

## 5. Barrel Export

Setiap module utama harus memiliki:

```text
index.ts
```

untuk public export.

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

Selesai:

* Market Engine
* Indicator Engine
* Strategy Engine
* Backtesting
* Paper Trading
* Live Trading Foundation

Sedang berjalan:

Production Safety Layer

---

# Code Quality Rules

Ketika mengubah kode:

* jangan mengubah API publik tanpa alasan
* jangan membuat duplicate class
* jangan membuat duplicate interface
* jangan membuat duplicate folder
* jangan membuat engine baru jika sudah ada
* gunakan struktur yang telah ada

---

# Build Requirements

Perubahan dianggap selesai apabila:

* TypeScript compile tanpa error
* Next.js build berhasil
* Tidak menambah circular dependency
* Tidak membuat dead code baru

---

# AI Assistant Guidelines

Saat menghasilkan kode:

* Ikuti struktur proyek yang sudah ada.
* Gunakan modul yang telah tersedia sebelum membuat modul baru.
* Hindari duplikasi implementasi.
* Pertahankan kompatibilitas dengan arsitektur AURA Trade OS.
* Jika perlu melakukan refactor besar, jelaskan alasan dan dampaknya sebelum mengubah struktur proyek.

