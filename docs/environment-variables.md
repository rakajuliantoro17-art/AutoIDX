# Environment Variables Reference

**Project:** AURA Trade OS

---

Semua environment variable diisi **HANYA** di:

**JANGAN** membuat file `.env`, `.env.local`, atau `.env.example` di repo ini. File dotenv pernah menyebabkan kebocoran kredensial live (API key Indodax, Firebase Admin private key) dua kali di proyek ini. Dokumen ini murni referensi nama variabel — bukan tempat menyimpan nilai asli.

Setiap kali menambah `process.env.X` baru di kode, tambahkan juga barisnya di tabel bawah pada PR yang sama.

---

## Firebase (Client)

Wajib prefix `NEXT_PUBLIC_` karena dibaca di browser.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Ya | Dari Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Ya | Biasanya `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Ya | ID project Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Ya | Biasanya `<project-id>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Ya | Dari Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Ya | Dari Firebase Console |

## Firebase Admin (Server-side only)

**Jangan pernah** diberi prefix `NEXT_PUBLIC_` — kalau ini bocor ke client bundle, siapa saja bisa mengambil alih seluruh project Firebase.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | Ya | Sama dengan project ID di atas |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Ya | Dari file service account JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Ya | Dari file service account JSON. Di Vercel, newline (`\n`) di key harus tetap tersimpan literal — cek dengan `.replace(/\\n/g, '\n')` saat dibaca di kode kalau Vercel mem-flatten-nya |

## Indodax Exchange

| Variabel | Wajib | Keterangan |
|---|---|---|
| `INDODAX_API_KEY` | Ya (untuk live trading) | Dari Indodax → Pengaturan → API Management |
| `INDODAX_SECRET_KEY` | Ya (untuk live trading) | **Nama variabelnya `INDODAX_SECRET_KEY`, BUKAN `INDODAX_SECRET`** — pernah salah tulis dan menyebabkan client baca `undefined` |
| `INDODAX_API_URL` | Tidak (ada default) | Default: `https://indodax.com` |

## AI Providers

| Variabel | Wajib | Keterangan |
|---|---|---|
| `OPENAI_API_KEY` | Kalau pakai fitur AI OpenAI | |
| `CLAUDE_API_KEY` | Kalau pakai fitur AI Anthropic/Claude | |
| `GEMINI_API_KEY` | Kalau pakai fitur AI Gemini | Dipanggil lewat raw REST fetch, bukan SDK |
| `DEEPSEEK_API_KEY` | Kalau pakai fitur AI DeepSeek | |

## Cron / Scheduled Jobs

| Variabel | Wajib | Keterangan |
|---|---|---|
| `CRON_SECRET` | Ya | Dicocokkan di `/api/cron/scan` untuk memvalidasi request dari cron-job.org bukan dari publik |

## Bot Mode & Safety

| Variabel | Wajib | Keterangan |
|---|---|---|
| `BOT_MODE` | Ya | `paper` (aman, tidak kirim order asli) atau `live` (order asli, uang sungguhan). **Default harus `paper`.** |
| `BOT_AUTO_TRADE` | Tidak | `true`/`false` — apakah bot boleh eksekusi otomatis tanpa konfirmasi manual |
| `BOT_EMERGENCY_STOP` | Tidak | `true`/`false` — kill switch, set `true` untuk hentikan semua trading tanpa redeploy |
| `BOT_INTERVAL` | Tidak | Interval scan dalam milidetik |
| `BOT_PAIR` | Tidak | Pair default, mis. `btc_idr` |

## Bot Trade Sizing

| Variabel | Wajib | Keterangan |
|---|---|---|
| `BOT_DEFAULT_TRADE_AMOUNT` | Ya | Nominal default per transaksi |
| `BOT_MAX_TRADE_AMOUNT` | Ya | Batas maksimum per transaksi |
| `MIN_ORDER_AMOUNT` | Ya | Minimum order Indodax (cek syarat exchange) |
| `ORDER_TYPE` | Tidak | `limit` atau `market` |

## Risk Management

| Variabel | Wajib | Keterangan |
|---|---|---|
| `BOT_TARGET_PROFIT` | Ya | Target profit per transaksi (%) |
| `BOT_STOP_LOSS` | Ya | Stop loss per transaksi (%) |
| `BOT_MAX_DAILY_LOSS` | Ya | Batas rugi harian sebelum bot berhenti otomatis |
| `BOT_MAX_EXPOSURE` | Ya | Batas total eksposur (% dari saldo) |
| `BOT_MAX_OPEN_POSITION` | Ya | Jumlah maksimum posisi terbuka bersamaan |
| `BOT_COOLDOWN` | Tidak | Jeda wajib (ms) antar transaksi pada pair yang sama |
| `TRAILING_STOP_ENABLED` | Tidak | `true`/`false` |
| `TRAILING_STOP_PERCENT` | Tidak | Dipakai kalau trailing stop aktif |

## Indicator Settings

| Variabel | Wajib | Keterangan |
|---|---|---|
| `EMA_FAST` | Tidak (ada default) | Periode EMA cepat |
| `EMA_SLOW` | Tidak (ada default) | Periode EMA lambat |
| `RSI_PERIOD` | Tidak (ada default) | Periode RSI |
| `RSI_OVERBOUGHT` | Tidak (ada default) | Ambang overbought, biasanya 70 |
| `RSI_OVERSOLD` | Tidak (ada default) | Ambang oversold, biasanya 30 |

## Fees

| Variabel | Wajib | Keterangan |
|---|---|---|
| `EXCHANGE_FEE` | Ya | Fee taker/maker Indodax, dipakai untuk hitung profit bersih |

## Runtime

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NODE_ENV` | Otomatis | Diset otomatis oleh Vercel (`production`/`development`), jangan diisi manual |

---

## GitHub Actions

GitHub Actions (`ci.yml`, `deploy.yml`) **tidak otomatis mewarisi** Environment Variables dari Vercel. Kalau ada workflow yang menjalankan `npm run build` atau `type-check` sendiri (bukan lewat `vercel build`), variabel yang dibutuhkan build — terutama semua `NEXT_PUBLIC_FIREBASE_*` — harus di-set terpisah sebagai **GitHub Secrets** (Repo → Settings → Secrets and variables → Actions).

---

## Checklist Sebelum Deploy

- [ ] Semua variabel "Wajib" di atas sudah diisi di Vercel (Production environment)
- [ ] `BOT_MODE` = `paper` kecuali memang sengaja mau live trading
- [ ] `INDODAX_SECRET_KEY` (bukan `INDODAX_SECRET`) sudah benar
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` ter-paste utuh termasuk `-----BEGIN PRIVATE KEY-----` dan newline-nya
- [ ] Tidak ada file `.env*` (kecuali `.env` bawaan yang sudah di-`.gitignore`) ikut ter-commit ke repo

- [ ] 
