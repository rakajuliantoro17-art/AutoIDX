# 🚀 AutoIDX - Automated Indodax Trading Bot

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**AutoIDX** adalah bot trading kripto otomatis yang dirancang khusus untuk platform **Indodax**. Dideploy menggunakan arsitektur *Serverless Function* dan *Vercel Cron*, bot ini mengeksekusi analisa teknikal secara berkala tanpa memerlukan server VPS 24/7.

---

## ✨ Fitur Utama

* ⚡ **Serverless Architecture:** Berjalan mulus di Vercel menggunakan Cron Jobs.
* 📈 **Analisa Teknikal:** Menggunakan strategi kombinasi EMA Crossover (Exponential Moving Average) dan RSI (Relative Strength Index).
* 🛡️ **Manajemen Risiko:** Dilengkapi fitur otomatis *Take-Profit* (TP) dan *Stop-Loss* (SL) untuk melindungi modal.
* 🔐 **Autentikasi Aman:** Menggunakan enkripsi HMAC-SHA512 untuk komunikasi terotentikasi dengan Indodax Private API.
* 📁 **Struktur Modular:** Kode yang bersih, terpisah antara API client, logika strategi, engine eksekusi, dan konfigurasi.

---

## 📁 Struktur Proyek

```text
AutoIDX/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automation CI/CD GitHub Actions ke Vercel
├── api/
│   └── index.py              # Entry point Vercel Serverless Function
├── docs/
│   ├── api.md                # Dokumentasi Endpoint Indodax API
│   ├── architecture.md       # Arsitektur & Alur Kerja Sistem
│   └── roadmap.md            # Rencana Pengembangan Proyek
├── config.py                 # Parameter Trading & Risk Management
├── engine.py                 # Core Bot Engine Execution
├── indodax_api.py            # Indodax Public & Private API Wrapper
├── strategy.py               # Algoritma Indikator Teknikal (EMA & RSI)
├── vercel.json               # Konfigurasi Vercel & Penjadwalan Cron Job
├── requirements.txt          # Dependensi Python
├── .gitignore                # Pengecualian File Sensitif
└── README.md                 # Dokumentasi Utama
