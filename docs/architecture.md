# 🏗️ AutoIDX - System Architecture

Dokumen ini menjelaskan rancangan arsitektur sistem, aliran data (*data flow*), serta mekanisme eksekusi bot trading **AutoIDX** yang dioptimalkan untuk platform **Vercel Serverless Architecture**.

---

## 📐 1. System Overview

AutoIDX menggunakan pendekatan **Event-Driven / Cron Triggered Serverless Architecture**. Karena dijalankan di lingkungan Serverless (Vercel Functions), bot tidak menggunakan *infinite loop* (`while True`), melainkan dieksekusi secara berkala melalui pemicu waktu (*Cron Job*).

```text
               ┌────────────────┐
               │  Vercel Cron   │
               └───────┬────────┘
                       │ (Trigger every N mins)
                       ▼
               ┌────────────────┐
               │ /api/index.py  │ (Serverless Entrypoint)
               └───────┬────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐               ┌──────────────┐
│  Indodax API │               │  Engine &    │
│  (Public)    │               │  Strategy    │
└──────┬───────┘               └──────┬───────┘
       │ Fetch Ticker                 │ Analyze Signal
       └───────────────┬──────────────┘
                       ▼
             ┌──────────────────┐
             │ Order Execution  │
             └─────────┬────────┘
                       │ Trade (Buy/Sell)
                       ▼
               ┌────────────────┐
               │  Indodax TAPI  │
               └────────────────┘
