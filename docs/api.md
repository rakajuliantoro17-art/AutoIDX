# 📖 AURA Trade OS
## Indodax API Integration Documentation

**Version:** v0.0.1 Alpha

Dokumen ini menjelaskan standar integrasi antara **AURA Trade OS** dan **Indodax API**.

---

# 1. API Overview

AURA Trade OS menggunakan dua kelompok endpoint resmi dari Indodax:

| API | Endpoint | Authentication | Purpose |
|------|----------|----------------|---------|
| Public API | https://indodax.com/api | No | Market Data |
| Private API | https://indodax.com/tapi | HMAC SHA512 | Trading |

---

# 2. Public API

Digunakan untuk:

- Market Scanner
- Dashboard
- Coin Ranking
- Volume
- Price History
- Order Book

## Contoh Endpoint

### Ticker

GET

```
https://indodax.com/api/ticker/btcidr
```

---

### Depth

GET

```
https://indodax.com/api/depth/btcidr
```

---

### Trades

GET

```
https://indodax.com/api/trades/btcidr
```

---

### Summaries

GET

```
https://indodax.com/api/summaries
```

Endpoint ini menjadi sumber utama untuk **Multi Pair Scanner**.

---

# 3. Private API (TAPI)

Digunakan untuk:

- Balance
- Trade
- Open Orders
- Order History
- Cancel Order
- Withdraw (tidak digunakan pada versi awal)

Semua request menggunakan:

```
POST
```

---

# 4. Authentication

Header

```http
Key: YOUR_API_KEY
Sign: HMAC_SHA512_SIGNATURE
Content-Type: application/x-www-form-urlencoded
```

---

# 5. Environment Variables

```bash
INDODAX_API_KEY=

INDODAX_SECRET_KEY=
```

API Key tidak boleh disimpan di repository.

Gunakan:

```
.env.local
```

atau

Environment Variables pada Vercel.

---

# 6. Rate Limiting

AURA Trade OS akan:

- menggunakan cache bila memungkinkan,
- menghindari request berlebihan,
- menjalankan scanner melalui Vercel Cron sesuai interval yang dikonfigurasi.

---

# 7. Supported Operations

| Operation | Status |
|-----------|--------|
| Market Scanner | ✅ |
| Get Ticker | ✅ |
| Get Depth | ✅ |
| Get Trades | ✅ |
| Get Summaries | ✅ |
| Get Balance | ✅ |
| Buy | v0.5.0 |
| Sell | v0.5.0 |
| Cancel Order | v0.5.0 |
| Withdraw | Tidak direncanakan |

---

# 8. Security Policy

AURA Trade OS menerapkan beberapa aturan keamanan:

- API Secret tidak pernah dikirim ke browser.
- Semua request Private API diproses di server.
- API Key tidak dicatat dalam log.
- Signature dibuat menggunakan HMAC SHA512.
- Seluruh error dicatat tanpa mengekspos kredensial.

---

# 9. Integration Flow

```
Dashboard

↓

Next.js API Route

↓

Indodax Service

↓

Indodax API

↓

Response

↓

Firebase Logger

↓

Dashboard Update
```

---

# 10. Roadmap

### v0.0.1

- Public API
- Balance
- Market Scanner

### v0.1.0

- Multi Pair Scanner
- Opportunity Ranking

### v0.2.0

- Paper Trading

### v0.5.0

- Auto Buy
- Auto Sell

### v1.0.0

- AI Assisted Trading
- Portfolio Optimization
