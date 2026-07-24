# 📖 AutoIDX - Indodax API Documentation

Dokumentasi ini menjelaskan integrasi API antara bot **AutoIDX** dan platform **Indodax**.

---

## 🌐 1. Base URL

Indodax menyediakan dua jenis API:

| Jenis API | Base URL | Autentikasi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Public API** | `https://indodax.com/api` | Tidak | Mengambil data pasar (Harga, Ticker, Depth) |
| **Private API (TAPI)** | `https://indodax.com/tapi` | Ya (HMAC-SHA512) | Eksekusi order, cek saldo, histori transaksi |

---

## 🔐 2. Autentikasi Private API (TAPI)

Semua *request* ke Private API harus dikirim menggunakan metode **HTTP POST** dengan *header* berikut:

### HTTP Headers
```http
Key: <INDODAX_API_KEY>
Sign: <HMAC_SHA512_SIGNATURE>
Content-Type: application/x-www-form-urlencoded
