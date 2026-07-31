# Claude Development Guide

**Project:** AURA Trade OS
**Version:** 0.1.2 Alpha
**Terakhir diaudit:** sesi build-fix marathon (lihat "Session Log" di bawah)

---

# Cara Pakai Dokumen Ini (untuk Claude sesi/akun lain)

Project ini dikerjakan lintas beberapa akun Claude berbeda + ChatGPT, secara paralel, oleh satu orang (Raka) yang bekerja **hanya lewat GitHub browser UI + Vercel dashboard** (tidak ada terminal/git lokal).

**Aturan wajib sebelum menyentuh kode apapun di sini:**

1. **Jangan percaya dokumen manapun (termasuk file ini) tanpa verifikasi langsung ke kode.** Riwayat project ini penuh dokumen progress yang mengklaim status lebih maju dari kenyataan.
2. **Selalu minta build log Vercel terbaru di awal sesi**, atau clone repo dan jalankan `npm run build` sendiri untuk tahu persis di mana build berhenti.
3. **Cek dulu apakah sebuah engine/service/type sudah ada** sebelum membuat yang baru — project ini sudah berkali-kali punya implementasi paralel untuk konsep yang sama (lihat tabel "Known Duplication").
4. Ikuti seluruh "Development Principles" di bawah — ini bukan saran, ini sudah terbukti mencegah kelas bug yang sama berulang.

---

# Project Overview

AURA Trade OS adalah platform trading cryptocurrency berbasis TypeScript untuk exchange Indodax.

Tujuan utama: Realtime Market Engine, Technical Indicator Engine, Strategy Engine, Backtesting, Paper Trading, Live Trading, AI Assisted Trading, Dashboard Monitoring.

Target deployment: GitHub → Vercel, database Firebase.

---

# Technology Stack

- Frontend: Next.js (App Router, kanonik), React, TypeScript, Tailwind CSS
- Backend: Vercel Functions
- Database: Firebase Firestore
- Realtime: Indodax WebSocket
- AI: OpenAI, Claude/Anthropic, Gemini (REST fetch langsung), DeepSeek

---

# Project Architecture (alur data yang seharusnya)
