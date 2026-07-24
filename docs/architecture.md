# 🏗️ AURA Trade OS
## System Architecture

**Version:** v0.0.1 Alpha

Dokumen ini menjelaskan arsitektur utama AURA Trade OS, alur data (*data flow*), pembagian modul, serta mekanisme eksekusi sistem.

---

# 📐 1. System Overview

AURA Trade OS dibangun menggunakan pendekatan **Modular Event-Driven Architecture**.

Setiap komponen memiliki tanggung jawab yang jelas sehingga mudah diuji, dikembangkan, dan dipelihara.

```
                        Internet
                            │
                            ▼
                     Indodax Exchange
                            │
                            ▼
────────────────────── Market Layer ──────────────────────

        Public API
        Order Book
        Market Data
        Price Feed

────────────────── Intelligence Layer ────────────────────

        Market Scanner
        Technical Analysis
        Strategy Engine
        Confidence Engine

──────────────────── Decision Layer ──────────────────────

        Risk Manager
        Position Manager
        Portfolio Manager

─────────────────── Execution Layer ──────────────────────

        Paper Trading
        Live Trading

────────────────── Monitoring Layer ──────────────────────

        Firebase
        Dashboard
        Activity Log
        Analytics
```

---

# 📂 2. Folder Architecture

```
src/

app/
components/
layouts/
pages/

services/

    ai/
    analytics/
    firebase/
    indicators/
    indodax/
    logger/
    portfolio/
    risk/
    scanner/
    strategy/

styles/
utils/
```

Setiap service hanya memiliki satu tanggung jawab (**Single Responsibility Principle**).

---

# 🔄 3. Data Flow

```
Indodax

↓

Market Scanner

↓

Technical Indicators

↓

Strategy Engine

↓

Risk Manager

↓

Execution Engine

↓

Firebase

↓

Dashboard
```

---

# ⚙️ 4. Scheduler

Untuk v0.0.1 sistem dijalankan menggunakan **Vercel Cron**.

```
Vercel Cron

↓

/api/bot

↓

Scanner

↓

Analysis

↓

Logging

↓

Finish
```

Belum terdapat proses yang berjalan terus-menerus (persistent process).

---

# 🧩 5. Core Modules

## Market Scanner

Bertugas:

- mengambil seluruh pair IDR,
- mengambil ticker,
- volume,
- order book,
- dan menyusun daftar kandidat.

---

## Technical Analysis

Menghitung indikator seperti:

- EMA
- RSI
- MACD
- ATR
- Bollinger Bands
- VWAP

---

## Strategy Engine

Menghasilkan sinyal berdasarkan indikator.

Contoh:

```
EMA Cross

+

RSI

+

Volume

↓

BUY SIGNAL
```

---

## Risk Engine

Memastikan sinyal memenuhi aturan risiko.

Contoh:

- Position Size
- Stop Loss
- Take Profit
- Maximum Exposure

---

## Execution Engine

Pada v0.0.1:

- hanya logging,
- belum mengirim order.

Pada versi berikutnya:

- Paper Trading
- Live Trading

---

## Firebase

Digunakan untuk:

- User Settings
- Activity Logs
- Portfolio State
- Bot Configuration

---

# 🖥️ 6. Dashboard

Dashboard menerima data dari Firebase.

Halaman utama:

- Dashboard
- Market Scanner
- Portfolio
- Analytics
- Settings

---

# 🔒 7. Security

Semua komunikasi dengan Private API dilakukan di sisi server.

API Key tidak pernah dikirim ke browser.

Environment Variables digunakan untuk:

- Indodax API
- Firebase
- AI Provider

---

# 🚀 8. Future Architecture

Versi berikutnya akan menambahkan:

```
Machine Learning

↓

Confidence Engine

↓

Adaptive Strategy

↓

Portfolio Optimizer
```

AI tidak melakukan transaksi secara langsung.

Semua keputusan tetap melewati:

- Strategy Engine
- Risk Engine
- Execution Engine

---

# 📌 9. Architecture Principles

AURA Trade OS dikembangkan berdasarkan prinsip:

- Modular Architecture
- Separation of Concerns
- Event-Driven Processing
- Serverless Ready
- Type Safety
- Secure by Default
- AI Assisted Decision Making
- Risk First
