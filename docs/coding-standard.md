# AURA Trade OS Coding Standard

Version : 1.0.0

Last Updated : Phase 19

---

# Purpose

Dokumen ini merupakan standar penulisan kode resmi untuk seluruh project **AURA Trade OS**.

Seluruh source code harus mengikuti dokumen ini agar:

* konsisten
* mudah dibaca
* mudah di-maintain
* mudah direview
* mudah dikembangkan hingga Phase Production

---

# General Principles

Seluruh kode harus mengikuti prinsip berikut:

* Clean Code
* SOLID Principle
* DRY (Don't Repeat Yourself)
* KISS (Keep It Simple)
* Single Responsibility
* High Readability
* Production Ready

---

# Language

Gunakan:

* TypeScript
* strict mode

Hindari penggunaan:

* any
* unknown tanpa alasan
* var

Gunakan

* const
* let

---

# File Naming

Gunakan camelCase.

Contoh:

```
exchangeService.ts
marketScanner.ts
riskManager.ts
```

Jangan gunakan

```
ExchangeService.ts
exchange_service.ts
Exchange_Service.ts
```

Kecuali:

React Component

```
DashboardCard.tsx
PortfolioTable.tsx
```

---

# Folder Naming

Gunakan:

```
services
components
config
utils
errors
types
```

Jangan gunakan:

```
Service
Components
UTILS
```

---

# Import Order

Urutan import:

```
1. Node Module

2. External Library

3. Internal Config

4. Internal Service

5. Internal Utils

6. Types
```

Contoh

```ts
import crypto from "crypto";

import axios from "axios";

import { env } from "@/config/env";

import { logger } from "@/services/logger";

import { formatDate } from "@/utils/date";

import type { Order } from "@/types";
```

---

# Comment Style

Gunakan comment block.

Contoh

```ts
/*
==========================================================
Risk Management
==========================================================
*/
```

Method

```ts
/*
==========================================================
Validate Order
==========================================================
*/
```

Jangan menggunakan comment yang tidak jelas.

```
fix

test

baru
```

---

# Line Length

Disarankan

maksimal

100 karakter

boleh lebih jika memang diperlukan.

---

# Indentation

Gunakan

4 spaces

Jangan menggunakan tab.

---

# Bracket Style

Gunakan

```ts
if (

    condition

) {

}
```

Bukan

```ts
if(condition){
}
```

---

# Class Naming

Gunakan PascalCase.

```
RiskManager

ExchangeService

TokenManager
```

---

# Variable Naming

Gunakan camelCase.

```
currentPrice

riskScore

marketData
```

Constant

Gunakan

UPPER_CASE

```
MAX_POSITION

DEFAULT_TIMEOUT
```

---

# Function Naming

Gunakan kata kerja.

Contoh

```
validate()

calculate()

execute()

start()

stop()

restart()

recover()
```

Hindari

```
data()

system()

run2()
```

---

# Boolean Naming

Gunakan

```
isTrading

hasPermission

canExecute

shouldRestart
```

Jangan

```
tradingFlag

status2
```

---

# Error Handling

Selalu gunakan custom error.

```
ValidationError

ExchangeError

TradingError
```

Jangan

```
throw new Error("Unknown")
```

untuk business logic.

---

# Logger

Gunakan

logger

Jangan menggunakan

```
console.log()

console.error()
```

kecuali debugging sementara.

---

# Environment Variable

Dilarang

```
process.env

```

langsung di service.

Gunakan

```
config/env.ts

↓

SecretManager

↓

Service
```

---

# Service Rule

Satu file

=

Satu Service

Contoh

```
RiskManager

PositionManager

OrderManager
```

Jangan mencampur banyak service dalam satu file.

---

# Dependency Rule

Service

boleh bergantung ke

Config

Logger

Types

Utils

Tidak boleh saling bergantung secara melingkar.

---

# Singleton

Gunakan pola

```ts
export const riskManager =
    new RiskManager();
```

---

# Async Rule

Selalu gunakan

```
async

await
```

Hindari

```
then()

catch()
```

untuk service internal.

---

# Security Rule

Semua request harus melewati:

```
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

# Recovery Rule

Recovery Layer

```
Watchdog

↓

Auto Recovery

↓

Restart Manager

↓

State Recovery
```

---

# Trading Rule

Trading Engine

tidak boleh

langsung

mengakses database.

Gunakan repository/service.

---

# Testing

Seluruh service baru harus memiliki:

* valid input
* invalid input
* edge case
* error handling

---

# Documentation

Seluruh file baru wajib memiliki header.

```ts
/**
==========================================================
AURA Trade OS

Version : x.x.x

==========================================================
*/
```

---

# TODO

Gunakan

```
TODO:

FIXME:

NOTE:
```

Jangan

```
nanti

besok

ingat
```

---

# Versioning

Seluruh perubahan mengikuti:

Semantic Version

```
Major

Minor

Patch
```

---

# AI Coding Rule

Seluruh AI Assistant wajib:

* mempertahankan arsitektur project
* tidak mengubah struktur folder tanpa persetujuan
* tidak membuat duplicate service
* tidak menggunakan any
* tidak menghapus komentar dokumentasi
* mengikuti standar formatting project
* menggunakan logger
* menggunakan custom error
* menjaga backward compatibility

---

# Architecture Principle

Seluruh project mengikuti prinsip:

```
Config

↓

Core

↓

Service

↓

Repository

↓

API

↓

UI
```

Dependency hanya boleh mengalir ke bawah.

Tidak boleh terjadi circular dependency.

---

# Production Target

Target akhir AURA Trade OS adalah:

* Enterprise Grade
* Modular Architecture
* High Performance
* High Availability
* Secure by Design
* Maintainable
* AI Assisted Development
* Multi Exchange Ready
* Production Ready

