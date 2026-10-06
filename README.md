# AURA Trade OS

Automated Indodax trading engine dengan dashboard monitoring. Repo: `AutoIDX` (private). Versi saat ini: **0.2.0 Alpha**.

## Stack

- Next.js 14 (App Router + Pages Router campuran, belum dimigrasi)
- TypeScript (strict), Tailwind CSS
- Firebase: Firestore (client SDK di frontend, Admin SDK di semua API/server)
- Indodax API, AI advisory opsional (OpenAI / Gemini / Claude / DeepSeek via REST)
- Deploy: Vercel. Scheduler: cron-job.org memanggil `/api/cron/scan` dan `/api/cron/reconcile`

## Menjalankan

```bash
npm install
npm run dev          # development
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

Node 22.x. Semua konfigurasi lewat Environment Variables Vercel (tidak ada file `.env` di repo). Daftar lengkap: [`docs/environment-variables.md`](docs/environment-variables.md).

## Keamanan live trading

Order live hanya jalan kalau **dua** syarat terpenuhi: `bot_control.mode === "live"` di Firestore **dan** env var `BOT_LIVE_CONFIRM=true`. Kredensial Indodax disimpan terenkripsi (AES-256-GCM) per user di Firestore.

## Menjaga pemakaian Vercel (Fluid Active CPU)

- Scan penuh dibatasi server-side: tidak jalan lebih sering dari `CRON_SCAN_MIN_INTERVAL_SECONDS` (default 60 detik), berapa pun frekuensi cron-job.org.
- Polling dashboard berhenti saat tab tidak terlihat dan berinterval 15-30 detik.
- Workflow GitHub Actions untuk cron sengaja dinonaktifkan (hanya `workflow_dispatch` manual); cron-job.org adalah satu-satunya trigger terjadwal.

## Dokumentasi

- [`docs/claude.md`](docs/claude.md): panduan dan catatan sesi pengembangan (baca ini dulu)
- [`docs/deployment.md`](docs/deployment.md): alur deploy
- [`docs/Orphanfile.md`](docs/Orphanfile.md): kandidat kode yatim/tidak terpakai

## Lisensi

MIT
