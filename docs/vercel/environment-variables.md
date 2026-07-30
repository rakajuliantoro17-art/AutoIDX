# AURA Trade OS

## Environment Variables (Vercel)

**Version:** 0.1.0 Alpha

---

# Overview

AURA Trade OS **tidak menggunakan file `.env` maupun `.env.example`** di dalam repository.

Seluruh konfigurasi disimpan pada:

> **Vercel → Project Settings → Environment Variables**

Dengan pendekatan ini:

* Secret tidak pernah masuk Git Repository.
* Konfigurasi Production, Preview, dan Development dapat dipisahkan.
* Lebih aman untuk API Key dan Trading Credential.

---

# Environment Scope

Setiap Environment Variable dapat diatur untuk:

| Scope       | Keterangan                                                 |
| ----------- | ---------------------------------------------------------- |
| Development | Digunakan saat `vercel dev` atau Development Environment.  |
| Preview     | Digunakan pada Preview Deployment (Pull Request / Branch). |
| Production  | Digunakan pada Deployment Production.                      |

---

# Firebase

## NEXT_PUBLIC_FIREBASE_API_KEY

**Required:** ✅

Firebase Web API Key.

---

## NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

**Required:** ✅

Firebase Authentication Domain.

---

## NEXT_PUBLIC_FIREBASE_PROJECT_ID

**Required:** ✅

Firebase Project ID.

---

## NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

**Required:** ✅

Firebase Storage Bucket.

---

## NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

**Required:** ✅

Firebase Messaging Sender ID.

---

## NEXT_PUBLIC_FIREBASE_APP_ID

**Required:** ✅

Firebase Application ID.

---

## FIREBASE_CLIENT_EMAIL

**Required:** ✅

Firebase Admin SDK Client Email.

---

## FIREBASE_PRIVATE_KEY

**Required:** ✅

Firebase Admin SDK Private Key.

Gunakan format asli dari Firebase.

Jangan mengubah karakter newline secara manual.

---

# Indodax

## INDODAX_API_KEY

**Required:** ✅

API Key akun Indodax.

Digunakan untuk:

* Live Trading
* Balance
* Order
* Portfolio

---

## INDODAX_SECRET_KEY

**Required:** ✅

Secret Key Indodax.

Digunakan untuk HMAC Signature.

Catatan:

Gunakan nama variabel ini secara konsisten di seluruh project.

Jangan menggunakan:

```
INDODAX_SECRET
```

---

# Trading Engine

## DEFAULT_PAIR

**Required:** ✅

Contoh:

```
btc_idr
```

---

## DEFAULT_TIMEFRAME

**Required:** ✅

Contoh:

```
1m
5m
15m
1h
4h
```

---

## DEFAULT_ORDER_TYPE

**Required:** ❌

Default:

```
MARKET
```

---

## MAX_POSITION_PERCENT

**Required:** ✅

Batas maksimum satu posisi.

Contoh:

```
20
```

Berarti:

20%

---

## MAX_EXPOSURE_PERCENT

**Required:** ✅

Total dana maksimum yang boleh aktif di market.

Contoh:

```
50
```

Berarti:

50%

---

## MIN_CONFIDENCE

**Required:** ✅

Confidence minimum agar Strategy boleh membuka posisi.

Contoh:

```
70
```

---

## FEE_PERCENT

**Required:** ❌

Trading Fee.

Contoh:

```
0.003
```

---

## SLIPPAGE_PERCENT

**Required:** ❌

Estimasi slippage.

Contoh:

```
0.001
```

---

# Scheduler

## CRON_SECRET

**Required:** ✅

Secret untuk endpoint Cron.

Digunakan pada:

```
/api/cron/*
```

---

## SCAN_INTERVAL

**Required:** ❌

Interval scanning market.

Contoh:

```
60
```

(detik)

---

# AI

## OPENAI_API_KEY

**Required:** ❌

Digunakan untuk AI Engine.

Belum dipakai pada versi Alpha.

---

## GEMINI_API_KEY

**Required:** ❌

Opsional.

Digunakan jika AI Provider menggunakan Gemini.

---

# Telegram

## TELEGRAM_BOT_TOKEN

**Required:** ❌

Bot Notification.

---

## TELEGRAM_CHAT_ID

**Required:** ❌

Chat tujuan notifikasi.

---

# Email

## SMTP_HOST

**Required:** ❌

---

## SMTP_PORT

**Required:** ❌

---

## SMTP_USER

**Required:** ❌

---

## SMTP_PASSWORD

**Required:** ❌

---

# Dashboard

## NEXT_PUBLIC_APP_NAME

**Required:** ❌

Default:

```
AURA Trade OS
```

---

## NEXT_PUBLIC_APP_VERSION

**Required:** ❌

Contoh:

```
0.1.0
```

---

# Logging

## LOG_LEVEL

**Required:** ❌

Pilihan:

```
debug
info
warn
error
```

Default:

```
info
```

---

# Production Checklist

Sebelum melakukan Deployment Production, pastikan:

* Semua Firebase Variable telah diisi.
* Semua Indodax Variable telah diisi.
* `INDODAX_SECRET_KEY` menggunakan nama yang benar.
* `CRON_SECRET` telah dibuat.
* Tidak ada Environment Variable yang kosong.
* Semua Environment Variable Production sudah dipilih pada Vercel Project Settings.

---

# Security Policy

* Jangan menyimpan API Key di repository.
* Jangan melakukan hardcode credential pada source code.
* Jangan mengirim screenshot Environment Variables.
* Gunakan Vercel Environment Variables sebagai satu-satunya sumber konfigurasi Production.

---

# Revision History

| Version     | Description                                 |
| ----------- | ------------------------------------------- |
| 0.1.0 Alpha | Initial Environment Variables Documentation |

Saya juga menyarankan membuat **`src/config/env.ts`** sebagai **single source of truth** yang membaca seluruh `process.env`, memvalidasi variabel yang wajib ada saat startup, dan menghindari masalah seperti `INDODAX_SECRET` vs `INDODAX_SECRET_KEY` terjadi lagi.
