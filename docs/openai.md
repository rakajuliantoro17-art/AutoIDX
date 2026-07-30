# OpenAI Development Guide

**Project:** AURA Trade OS

**Version:** 0.1.0 Alpha

---

# Purpose

Dokumen ini berisi aturan pengembangan untuk AI berbasis OpenAI (ChatGPT, Codex, GPT) agar setiap perubahan kode tetap konsisten dengan arsitektur AURA Trade OS.

Prioritas utama:

1. Menjaga stabilitas arsitektur.
2. Menghindari duplikasi kode.
3. Mengutamakan reusable component.
4. Menghasilkan kode production-ready.

---

# Project Overview

AURA Trade OS adalah sistem trading cryptocurrency berbasis TypeScript untuk Indodax.

Arsitektur utama:

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

↓

Portfolio

↓

Dashboard

↓

AI Layer
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Vercel Functions

## Database

* Firebase

## Deployment

* Vercel

---

# Current Project Status

Selesai:

* Market Engine
* Indicator Engine
* Strategy Engine
* Backtesting
* Paper Trading
* Live Trading Foundation

Tahap berikutnya:

Production Safety Layer

---

# General Coding Rules

## TypeScript Only

Seluruh source code menggunakan TypeScript.

Jangan menghasilkan JavaScript.

---

## Reuse Existing Code

Sebelum membuat:

* class
* function
* service
* interface

selalu periksa apakah implementasi serupa sudah tersedia.

Jangan membuat implementasi baru jika fungsi yang sama sudah ada.

---

## Shared Types

Semua interface bersama harus ditempatkan pada:

```text
types.ts
```

Jangan mendefinisikan interface identik di beberapa file.

---

## Barrel Export

Gunakan:

```text
index.ts
```

untuk public export.

Jangan mengimpor file internal jika sudah tersedia melalui barrel export.

---

## Single Responsibility

Satu file memiliki satu tanggung jawab.

Contoh:

* riskManager hanya mengelola validasi risiko.
* orderExecutor hanya mengirim order.
* indicator tidak melakukan trading.

---

# Import Rules

Gunakan:

```ts
import type { RiskDecision } from "../types";
```

untuk type.

Gunakan named export jika memungkinkan.

---

# Environment Variables

Seluruh konfigurasi production berasal dari:

Vercel Project Settings

Jangan:

* membuat `.env`
* membuat `.env.example`
* hardcode API Key

Dokumentasi tersedia pada:

```text
docs/vercel/environment-variables.md
```

---

# Error Handling

Gunakan:

* try/catch

atau

* Result Object

Jangan melempar error yang tidak ditangani.

---

# Logging

Untuk production:

Jangan menggunakan:

```ts
console.log()
```

Gunakan Logger Service proyek.

---

# Trading Flow

Order harus selalu mengikuti urutan:

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

Risk Layer tidak boleh dilewati.

---

# Risk Rules

Order harus ditolak apabila:

* confidence terlalu rendah
* exposure melewati batas
* position limit terlampaui
* saldo tidak cukup
* monitoring critical

---

# Refactoring Policy

Refactor diperbolehkan apabila:

* mengurangi duplikasi
* meningkatkan keterbacaan
* meningkatkan maintainability

Refactor tidak boleh:

* mengubah public API tanpa alasan kuat
* mengubah struktur folder secara besar-besaran tanpa persetujuan
* memutus kompatibilitas modul lain

---

# File Naming

Class

PascalCase

Function

camelCase

Constant

UPPER_CASE

File

camelCase.ts

---

# Folder Structure

```text
src/services/

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

Jangan membuat folder baru jika struktur yang ada sudah memadai.

---

# Build Requirements

Perubahan dianggap selesai apabila:

* TypeScript compile tanpa error.
* Next.js build berhasil.
* Tidak menambah circular dependency.
* Tidak menghasilkan dead code.
* Tidak menambah duplicate module.

---

# AI Response Guidelines

Saat menghasilkan kode:

* Pertahankan gaya kode yang sudah ada.
* Jangan mengubah komentar header proyek.
* Jangan menghapus dokumentasi yang masih relevan.
* Buat perubahan sekecil mungkin untuk menyelesaikan masalah.
* Jika menemukan masalah arsitektur, jelaskan terlebih dahulu sebelum melakukan refactor besar.
* Prioritaskan stabilitas dibanding penambahan fitur baru.

---

# Long-Term Goal

Target akhir AURA Trade OS:

* Production-grade trading engine.
* Modular architecture.
* AI-assisted trading.
* Machine learning integration.
* Automated deployment melalui GitHub dan Vercel.
* Mudah dipelihara dan dikembangkan dalam jangka panjang.

