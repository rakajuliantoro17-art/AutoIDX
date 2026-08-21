# 🚀 AURA Trade OS

> **Adaptive Unified Risk & AI Trading Operating System**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Overview

**AURA Trade OS** adalah platform trading otomatis berbasis AI yang dirancang khusus untuk **Indodax Exchange**.

Berbeda dengan trading bot biasa, AURA Trade OS dibangun sebagai **Trading Operating System** yang terdiri dari berbagai modul independen seperti:

- 📊 Market Scanner
- 📈 Technical Analysis Engine
- 🤖 AI Confidence Engine
- 🛡️ Risk Management
- 💼 Portfolio Manager
- ⚡ Auto Trading Engine
- 📉 Analytics Dashboard

Seluruh sistem dikembangkan secara modular sehingga mudah dikembangkan hingga versi Machine Learning.

---

# ✨ Features

## ✅ Market Intelligence

- Multi Pair Scanner
- Market Ranking
- Top Gainers
- Top Losers
- Volume Scanner
- Liquidity Scanner
- Order Book Analysis

---

## 📈 Technical Analysis

- EMA
- RSI
- MACD
- ATR
- Bollinger Bands
- VWAP
- ADX

---

## 🛡 Risk Management

- Position Sizing
- Dynamic Stop Loss
- Dynamic Take Profit
- Trailing Stop
- Daily Loss Limit
- Maximum Drawdown
- Portfolio Allocation

---

## 🤖 AI (Roadmap)

- Confidence Score
- Strategy Optimizer
- Adaptive Strategy
- Machine Learning
- Historical Learning

---

## 📊 Dashboard

- Portfolio
- Open Position
- Daily Profit
- Monthly Profit
- Win Rate
- Drawdown
- Activity Log
- Strategy Performance
- System Health

---

# 🏗 Architecture

```
Indodax API
      │
      ▼
Market Scanner
      │
      ▼
Technical Analysis
      │
      ▼
Risk Management
      │
      ▼
Strategy Engine
      │
      ▼
Execution Engine
      │
      ▼
Firebase
      │
      ▼
Dashboard
```

---

# 📁 Project Structure

```text
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

---

# 🚀 Development Roadmap

## v0.0.1

- Project Bootstrap
- Dashboard
- Firebase
- Market Scanner
- Live Market
- Logging

---

## v0.1.0

- Technical Indicators
- Multi Pair Scanner
- Opportunity Ranking
- Portfolio

---

## v0.2.0

- Paper Trading
- Strategy Engine
- Backtesting

---

## v0.5.0

- Auto Trading
- Telegram Notification
- Dynamic Risk Engine

---

## v1.0.0

- Machine Learning
- AI Confidence
- Portfolio Optimizer
- Adaptive Trading

---

# 🛠 Technology Stack

- Next.js
- TypeScript
- TailwindCSS
- Firebase
- Vercel
- Indodax API

---
Integrasi AI Explainability (Observability Only) — AutoIDX
File di paket ini
BARU: `src/services/intelligence/ai/decisionExplainer.ts`
Adapter tipis yang menggabungkan `ai/confidence.ts` + `ai/explanation.ts`
(yang sebelumnya orphan) menjadi satu baris log siap pakai.
DIUBAH: `src/services/trading/engine.ts`
Hanya 3 perubahan kecil di fungsi `logAIAdvisory()`:
1 baris import baru (`explainDecision`)
1 blok `try/catch` tambahan di dalam loop per-provider (setelah log "AI Advisory", sebelum `consensusInputs.push`)
1 blok `try/catch` tambahan setelah `aiConsensus.evaluate()`
Cara upload ke GitHub (browser UI, tanpa terminal)
Buka repo → masuk ke folder `src/services/intelligence/ai/`
Klik "Add file" → "Upload files" → drag `decisionExplainer.ts` dari paket ini
Buka `src/services/trading/engine.ts` di GitHub → klik ikon pensil (edit)
Replace SELURUH isi file dengan isi `engine.ts` dari paket ini (sudah lengkap, bukan cuma potongan)
Commit langsung ke `main`, atau lewat PR kalau mau di-review dulu
PENTING — kenapa cuma 2 file ini, bukan semua orphan
Cluster `services/intelligence/ai/*` lain (`sentiment.ts`, `client.ts`,
`orchestrator.ts`, `router.ts`, `analyzer.ts`) dan `fusion/voting.ts`
+`fusion/decision.ts`+`fusion/confidence.ts` SENGAJA TIDAK diintegrasikan.
Semua itu duplikat/pengganti dari logika yang sudah aktif di `engine.ts`
(AI consensus, sanity check strategi) — menyambungkannya akan
menciptakan sinyal ganda yang bisa saling kontradiksi dalam satu
keputusan buy/sell. Detail lengkap sudah dijelaskan di chat.
Verifikasi tipe
Sandbox saya tidak punya akses internet jadi `npm install` + `tsc`
tidak bisa dijalankan di sini. Saya sudah verifikasi manual:
`IndicatorFeatureVector` (dipakai `engine.ts`) dan `FeatureVector`
(dibutuhkan `confidence.ts`/`explanation.ts`) — identik strukturnya
`AISignal` (consensus.ts) dan `TradingSignal` (types.ts) — identik
`parseAIResponse()` mengembalikan `AIAnalysis` dari sumber tipe yang
sama persis dengan yang dipakai `decisionExplainer.ts`
Tolong tetap jalankan `npm run build` (lokal atau lihat build log
Vercel) sebelum merge ke `main`, sesuai aturan wajib di `docs/claude.md`
— jangan percaya klaim "sudah aman" dari sesi manapun (termasuk ini)
tanpa verifikasi build sungguhan.
Efek ke trading
NOL. Ini murni menambah baris log baru bertag `[AI Explainability ...]`
di collection `logs` Firestore (dashboard Activity). Tidak ada nilai
yang dipakai risk-gate, sizing, atau keputusan BUY/SELL/HOLD yang berubah.
# 📄 License

MIT License

Copyright © 2026
Raka Juliantoro
