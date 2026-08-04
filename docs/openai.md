# OpenAI Development Guide

## AURA Trade OS

**Project Version:** 0.1.0 Alpha

**Current Phase:** Phase 17 Complete

**Deployment:** GitHub + Vercel + Firebase

---

# Project Vision

AURA Trade OS adalah platform trading cryptocurrency berbasis TypeScript yang dibangun dengan arsitektur modular, scalable, dan AI-ready.

Tujuan jangka panjang proyek bukan sekadar membuat trading bot, tetapi membangun **Trading Operating System** yang memiliki:

* Market Data Engine
* Technical Indicator Engine
* Strategy Engine
* Backtesting
* Paper Trading
* Live Trading
* Risk Management
* Portfolio Analytics
* AI Assistant
* Machine Learning
* Dashboard Monitoring
* Multi Exchange Support

---

# Architecture

```text
Realtime Market

↓

Indicator Engine

↓

Strategy Engine

↓

Risk Engine

↓

Execution Engine

↓

Portfolio

↓

Analytics

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
* TailwindCSS

## Backend

* Vercel Functions

## Database

* Firebase Firestore

## Trading Exchange

* Indodax REST API
* Indodax WebSocket

## Deployment

* GitHub
* Vercel

---

# Current Progress

## Phase 1

Project Initialization

Status

✅ Complete

---

## Phase 2

Configuration

Status

✅ Complete

---

## Phase 3

Logger

Status

✅ Complete

---

## Phase 4

Utilities

Status

✅ Complete

---

## Phase 5

Database

Status

✅ Complete

---

## Phase 6

API Layer

Status

✅ Complete

---

## Phase 7

Authentication

Status

✅ Complete

---

## Phase 8

Realtime Market

Status

✅ Complete

---

## Phase 9

Market Engine

Completed

* Candles
* OrderBook
* Ticker
* WebSocket

---

## Phase 10

Paper Trading

Completed

* Account
* Orders
* Tracker
* Engine
* Simulator

---

## Phase 11

Market Service

Completed

* Candle Builder
* OrderBook
* Ticker Service
* Socket Manager

---

## Phase 12

Indicator Engine

Completed

Momentum

* RSI
* MACD
* Stochastic

Trend

* EMA
* SMA
* ADX

Volatility

* ATR
* Bollinger Bands

Volume

* OBV

Signal

* Generator
* Fusion

Infrastructure

* Registry
* Manager

---

## Phase 13

Strategy Engine

Completed

Strategies

* EMA Crossover
* Momentum
* AuraTrend

Rules

* Entry
* Exit
* Filter

Scoring

* Confidence
* Strategy Score

Infrastructure

* Registry
* Manager
* Engine

---

## Phase 14

Backtesting

Completed

* Runner
* Simulator
* Portfolio
* Metrics
* Report
* Engine

---

## Phase 15

Backtest Runtime

Status

✅ Complete

---

## Phase 16

Paper Trading Runtime

Status

✅ Complete

---

## Phase 17

Live Trading

Completed

Exchange

* Account
* Market
* Order Executor
* Indodax Client

Execution

* Order Manager
* Fill Handler
* Order Tracker

Monitoring

* Health
* Heartbeat

Risk

* Exposure
* Position Limit
* Risk Manager

Core

* Engine
* Types
* Index

Status

✅ Complete

---

# Current Architecture

```text
src/services/

api/

auth/

database/

logger/

market/

indicator/

strategy/

backtest/

paperTrading/

liveTrading/

utils/
```

---

# Development Rules

## TypeScript Only

Seluruh source menggunakan TypeScript.

Jangan menghasilkan JavaScript.

---

## Modular

Satu folder memiliki satu domain.

Jangan mencampurkan:

* Strategy
* Market
* Indicator
* Live Trading

---

## Single Responsibility

Satu file hanya memiliki satu tanggung jawab.

---

## Shared Types

Semua interface berada pada:

```text
types.ts
```

Jangan membuat interface identik di file lain.

---

## Barrel Export

Gunakan

```text
index.ts
```

sebagai public entry point.

---

## Import Rules

Gunakan

```ts
import type {}
```

untuk type.

---

## Environment Variables

Project **tidak menggunakan**:

* `.env`
* `.env.example`

Seluruh konfigurasi Production menggunakan:

Vercel → Project Settings → Environment Variables

Referensi:

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

Gunakan Logger Service.

---

# Error Handling

Gunakan:

* try/catch

atau

* Result Pattern

---

# Trading Flow

Trading selalu mengikuti urutan berikut:

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

Order harus ditolak jika:

* Confidence rendah
* Balance tidak cukup
* Exposure melebihi batas
* Position Limit terlampaui
* Health Monitor status Critical

---

# Refactoring Rules

AI diperbolehkan melakukan refactor apabila:

* Mengurangi duplikasi
* Meningkatkan maintainability
* Menyederhanakan struktur

AI tidak boleh:

* Mengubah public API tanpa alasan
* Menghapus fitur aktif
* Membuat folder baru bila tidak diperlukan
* Membuat duplicate engine
* Membuat duplicate interface

---

# Build Rules

Setiap perubahan harus memenuhi:

* Next.js Build sukses
* TypeScript tanpa error
* Tidak ada circular dependency
* Tidak ada dead code baru
* Tidak ada duplicate module

---

# Planned Upgrade

## Phase 17.5

Codebase Stabilization

Target

* Environment Audit
* Folder Cleanup
* Duplicate Removal
* Route Cleanup
* Barrel Export Audit
* Type Cleanup
* Build Optimization
* Production Validation

---

## Phase 18

Production Safety Layer

Planned Modules

```text
safety/

emergencyStop.ts

circuitBreaker.ts

tradeGuard.ts

cooldown.ts

lossLimiter.ts

auditLogger.ts
```

Fungsi

* Emergency Stop
* Circuit Breaker
* Daily Loss Limit
* Cooldown
* Audit Trail

---

## Phase 19

Portfolio Analytics

Rencana

* Equity Curve
* Monthly Performance
* Win Rate
* Drawdown
* Sharpe Ratio
* Profit Factor
* Trade Journal

---

## Phase 20

Professional Dashboard

Rencana

* Live Portfolio
* Live Positions
* Watchlist
* Order History
* Risk Gauge
* Heatmap
* Trading Calendar

---

## Phase 21

Notification Center

Rencana

* Telegram
* Discord
* Email
* Push Notification

---

## Phase 22

AI Assistant

Rencana

* Trade Explanation
* Signal Summary
* Market Insight
* Portfolio Review
* Daily Report

---

## Phase 23

Machine Learning

Rencana

* Model Training
* Feature Engineering
* Prediction Engine
* Walk Forward Validation
* Hyperparameter Optimization

---

## Phase 24

Multi Exchange

Target

* Indodax
* Binance
* Bybit
* OKX
* Coinbase

Menggunakan Adapter Pattern sehingga Strategy Engine tidak bergantung pada satu exchange.

---

## Phase 25

Plugin System

Rencana

* Custom Indicator
* Custom Strategy
* Custom Risk Rule
* Custom Dashboard Widget

---

## Phase 26

Cloud Trading

Target

* Multi Instance
* Scheduler
* Distributed Worker
* Queue System
* Auto Recovery

---

## Phase 27

Enterprise Version

Rencana

* Multi User
* Role Based Access
* Team Portfolio
* API Management
* Audit Dashboard

---

# Optional Future Enhancements

Berikut fitur yang tidak wajib tetapi akan meningkatkan kualitas AURA Trade OS.

## Optimization

* Redis Cache
* Event Bus
* Web Worker
* Message Queue
* Lazy Loading Indicator

## Security

* Secret Rotation
* IP Allowlist
* API Rate Limiter
* Encryption at Rest

## Testing

* Unit Test
* Integration Test
* End-to-End Test
* Backtest Regression Test

## DevOps

* GitHub Actions
* Automatic Versioning
* Semantic Release
* Docker Support

## Monitoring

* Sentry
* OpenTelemetry
* Grafana
* Prometheus

---

# Long-Term Vision

Target akhir AURA Trade OS adalah menjadi platform trading modular yang mampu:

* melakukan analisis realtime,
* menjalankan strategi otomatis,
* mengelola risiko secara mandiri,
* melakukan optimasi menggunakan AI,
* mendukung banyak exchange,
* dan siap digunakan baik oleh trader individu maupun tim.

---

# AI Guidelines

Saat memberikan perubahan kode:

1. Pahami arsitektur yang sudah ada sebelum membuat file baru.
2. Prioritaskan penggunaan modul yang telah tersedia.
3. Hindari duplikasi implementasi.
4. Pertahankan kompatibilitas dengan modul lain.
5. Jelaskan dampak jika melakukan refactor besar.
6. Selalu utamakan stabilitas dibanding penambahan fitur.
7. Perlakukan dokumen ini sebagai referensi utama ketika memberikan saran atau menghasilkan kode untuk AURA Trade OS.
