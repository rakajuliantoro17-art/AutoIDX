# 🤖 AutoIDX Bot API

> Version: **0.0.1 Alpha**  
> Module: **Trading Orchestrator**

---

## Overview

Folder ini merupakan pusat orkestrasi bot trading AutoIDX.

Endpoint `/api/bot` dijalankan secara otomatis oleh **Vercel Cron** sesuai jadwal pada `vercel.json`.

Bot **tidak berjalan secara terus-menerus (infinite loop)**. Setiap pemanggilan endpoint hanya menjalankan **satu siklus analisis dan eksekusi**, sehingga sesuai dengan arsitektur **Serverless**.

---

## Architecture

```text
Vercel Cron
      │
      ▼
GET /api/bot
      │
      ▼
Load Configuration
      │
      ▼
Load Bot State
      │
      ▼
Market Scanner
      │
      ▼
Technical Indicators
      │
      ▼
Strategy Engine
      │
      ▼
Risk Engine
      │
      ▼
Paper Trading / Live Trading
      │
      ▼
Save State
      │
      ▼
Activity Logger
      │
      ▼
JSON Response
```

---

## Folder Structure

```text
bot/

├── route.ts
├── execute.ts
├── market.ts
├── strategy.ts
├── risk.ts
├── execution.ts
├── portfolio.ts
├── state.ts
├── logger.ts
├── health.ts
├── response.ts
├── constants.ts
├── types.ts
└── README.md
```

---

## Module Responsibilities

### route.ts

API endpoint utama.

Tanggung jawab:

- menerima request dari Vercel Cron
- memanggil `execute.ts`
- mengembalikan response JSON

Tidak boleh berisi logika trading.

---

### execute.ts

Trading Orchestrator.

Menjalankan seluruh pipeline bot.

---

### market.ts

Mengambil data market dari Indodax.

Contoh:

- BTC/IDR
- ETH/IDR
- SOL/IDR
- XRP/IDR

---

### strategy.ts

Memanggil Strategy Engine.

Tidak menghitung indikator secara langsung.

---

### risk.ts

Validasi risiko.

Meliputi:

- Stop Loss
- Take Profit
- Position Size
- Daily Loss Limit
- Maximum Exposure

---

### execution.ts

Mengirim order BUY atau SELL ke Indodax.

---

### portfolio.ts

Mengambil informasi:

- saldo
- posisi terbuka
- profit
- drawdown

---

### state.ts

Menyimpan status bot secara persisten.

Contoh data:

- posisi aktif
- harga beli
- order ID
- waktu transaksi terakhir

---

### logger.ts

Mencatat seluruh aktivitas bot.

Output dapat disimpan ke Firebase dan digunakan oleh Dashboard.

---

### health.ts

Health Check endpoint.

Digunakan untuk monitoring.

---

### response.ts

Utility untuk format response API yang konsisten.

---

### constants.ts

Konstanta internal bot.

---

### types.ts

Seluruh interface TypeScript.

---

## Execution Flow

```text
Cron Trigger

↓

Load Config

↓

Load State

↓

Scan Market

↓

Analyze Indicators

↓

Generate Signal

↓

Risk Validation

↓

Execute Order

↓

Save State

↓

Write Log

↓

Return Response
```

---

## Trading Modes

### Paper Mode

Bot melakukan simulasi transaksi.

Tidak mengirim order ke Indodax.

---

### Live Mode

Bot mengirim order ke Indodax menggunakan API Key.

Gunakan hanya setelah strategi lolos paper trading dan backtesting.

---

## Supported Strategies (Roadmap)

Current:

- EMA Crossover
- RSI Filter

Planned:

- MACD
- ATR
- Bollinger Bands
- VWAP
- ADX
- Order Book Analysis
- AI Confidence Score
- Machine Learning Strategy

---

## Risk Management

Seluruh transaksi harus melewati Risk Engine.

Risk Engine bertugas:

- menentukan ukuran posisi
- memvalidasi Stop Loss
- memvalidasi Take Profit
- membatasi eksposur modal
- membatasi jumlah posisi aktif

---

## Logging

Setiap eksekusi menghasilkan log yang berisi:

- waktu eksekusi
- pair
- harga
- sinyal
- keputusan
- hasil transaksi
- durasi proses

---

## Future Roadmap

### v0.1.0

- Multi Pair Trading
- Portfolio Manager
- Paper Trading
- Dynamic Position Sizing

### v0.2.0

- Backtesting Engine
- Historical Analytics
- Strategy Comparison

### v0.5.0

- AI Confidence Score
- Smart Opportunity Ranking

### v1.0.0

- Machine Learning Engine
- Adaptive Strategy Selection
- Multi Asset Portfolio
- Autonomous Trading System

---

## Development Principles

Semua perubahan harus mengikuti urutan berikut:

```text
Development

↓

Unit Test

↓

Paper Trading

↓

Backtesting

↓

Review

↓

Release
```

Tidak ada strategi yang langsung digunakan pada akun live tanpa melalui tahap validasi.
