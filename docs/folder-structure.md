# AURA Trade OS Folder Structure

Version : 1.0.0

Last Updated : Phase 19

---

# Overview

Dokumen ini menjelaskan struktur folder resmi AURA Trade OS.

Tujuan utama:

* Konsistensi
* Modular
* Mudah dikembangkan
* Mudah dipelihara
* Enterprise Ready

---

# Root Structure

```text
AURA Trade OS

├── docs/
├── public/
├── src/
├── scripts/
├── package.json
├── tsconfig.json
├── next.config.js
├── README.md
└── LICENSE
```

---

# docs/

Berisi seluruh dokumentasi proyek.

```text
docs/

coding-standard.md
deployment.md
folder-structure.md
openai.md
claude.md
vercel/
```

---

# public/

Asset statis.

```text
public/

images/
icons/
robots.txt
favicon.ico
```

---

# src/

Seluruh source code.

---

# src/app/

Next.js App Router.

```text
app/

dashboard/
api/
layout.tsx
page.tsx
```

---

# src/pages/

Legacy Pages Router (jika masih digunakan).

---

# src/components/

Komponen React.

```text
components/

cards/
charts/
forms/
layout/
tables/
ui/
```

---

# src/config/

Seluruh konfigurasi.

```text
config/

constants.ts
env.ts
limits.ts
```

---

# src/errors/

Custom Error.

```text
errors/

ExchangeError.ts
TradingError.ts
ValidationError.ts
index.ts
```

---

# src/hooks/

React Hooks.

```text
hooks/

usePortfolio.ts
useMarket.ts
useTheme.ts
```

---

# src/lib/

Utility umum.

```text
lib/

validators/
helpers/
utils/
```

---

# src/services/

Core Business Logic.

## exchange/

```text
exchange/

indodaxClient.ts
exchangeService.ts
```

---

## market/

```text
market/

scanner.ts
ticker.ts
orderbook.ts
```

---

## strategy/

```text
strategy/

strategyEngine.ts
ema.ts
macd.ts
rsi.ts
```

---

## indicator/

```text
indicator/

ema.ts
rsi.ts
macd.ts
bollinger.ts
```

---

## liveTrading/

```text
liveTrading/

engine.ts

exchange/
monitor/
risk/
types.ts
index.ts
```

---

## paperTrading/

```text
paperTrading/

engine.ts
portfolio.ts
simulator.ts
```

---

## automation/

```text
automation/

scheduler.ts
cron.ts
engine.ts
```

---

## monitor/

```text
monitor/

alertManager.ts
diagnostic.ts
latencyMonitor.ts
memoryMonitor.ts
notification.ts
performanceMonitor.ts
processMonitor.ts
schedulerMonitor.ts
systemReport.ts
uptime.ts
```

---

## maintenance/

```text
maintenance/

cleanup.ts
databaseMaintenance.ts
optimize.ts
versionChecker.ts
```

---

## recovery/

```text
recovery/

autoRecovery.ts
emergencyShutdown.ts
restartManager.ts
stateRecovery.ts
watchdog.ts
```

---

## cache/

```text
cache/

cacheManager.ts
marketCache.ts
orderCache.ts
strategyCache.ts
```

---

## logger/

```text
logger/

consoleLogger.ts
fileLogger.ts
logger.ts
logRotation.ts
remoteLogger.ts
```

---

## security/

```text
security/

apiGuard.ts
auditLogger.ts
authGuard.ts
csrfGuard.ts
ipGuard.ts
permission.ts
rateLimiter.ts
secretManager.ts
signature.ts
tokenManager.ts
```

---

# src/store/

Global state.

```text
store/

auth.ts
portfolio.ts
settings.ts
```

---

# src/types/

Global TypeScript types.

```text
types/

exchange.ts
market.ts
order.ts
portfolio.ts
strategy.ts
```

---

# src/utils/

Utility function.

```text
utils/

date.ts
number.ts
format.ts
math.ts
```

---

# scripts/

Utility script.

```text
scripts/

checkBuild.ts
validateEnv.ts
```

---

# Dependency Direction

Project mengikuti dependency berikut:

```text
Config

↓

Utils

↓

Services

↓

Repository

↓

API

↓

UI
```

Dependency hanya boleh mengalir ke bawah.

Tidak boleh ada circular dependency.

---

# Security Layer

```text
security/

IpGuard

↓

RateLimiter

↓

ApiGuard

↓

AuthGuard

↓

Signature

↓

Permission

↓

Business Logic
```

---

# Recovery Layer

```text
Watchdog

↓

Auto Recovery

↓

Restart Manager

↓

State Recovery
```

---

# Monitoring Layer

```text
Performance

Latency

Memory

Scheduler

Process

Notification

Alert
```

---

# Trading Layer

```text
Market

↓

Strategy

↓

Risk

↓

Order

↓

Portfolio

↓

Exchange
```

---

# Phase Expansion

## Phase 20

```text
services/

analytics/
```

---

## Phase 21

```text
services/

backtesting/
```

---

## Phase 22

```text
services/

machineLearning/
```

---

## Phase 23

```text
services/

portfolioOptimization/
```

---

## Phase 24

```text
services/

notification/
```

---

## Phase 25

```text
services/

exchange/

binance/
bybit/
okx/
```

---

## Phase 26

```text
services/

cluster/
```

---

## Phase 27

```text
services/

distributed/
```

---

## Phase 28

```text
services/

cloud/
```

---

## Phase 29

```text
services/

enterprise/
```

---

## Phase 30

```text
services/

ai/

prediction/

optimizer/

decision/
```

---

# Rules

Setiap folder hanya memiliki satu tanggung jawab.

Tidak boleh ada:

* duplicate service
* duplicate indicator
* duplicate engine
* duplicate validator

---

# Naming Rules

Folder:

camelCase

File:

camelCase

Component:

PascalCase

Type:

PascalCase

Constant:

UPPER_CASE

---

# Final Goal

Target struktur folder AURA Trade OS adalah:

* Modular
* Clean Architecture
* Enterprise Grade
* AI Friendly
* Production Ready
* Easily Scalable
* Multi Exchange Ready
* Long-Term Maintainable

