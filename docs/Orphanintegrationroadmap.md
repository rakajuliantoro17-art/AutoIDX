# Roadmap Integrasi Fitur Orphan (AI / ML / Messaging)

Ditulis: sesi audit orphan-file, Agustus 2026. Baca `docs/claude.md` dulu (terutama
"Known Duplication") sebelum lanjut — dokumen ini melengkapi, bukan menggantikan.

## Cara baca dokumen ini

Setiap cluster di bawah punya status yang **sudah diverifikasi langsung ke kode**
(bukan cuma baca komentar/nama file), plus rekomendasi urutan kerja. Prinsip yang
dipakai sama seperti `docs/claude.md`: jangan sambungkan apapun yang state-nya
in-memory ke Vercel serverless, jangan buat sistem paralel baru untuk konsep yang
sudah ada implementasinya, dan verifikasi tiap perubahan lewat `tsc --noEmit` +
`npm run build` asli sebelum diklaim selesai.

---

## 1. Tiga sistem AI/ML paralel — WAJIB pilih satu sebelum lanjut

Ditemukan **tiga** cluster berbeda yang semuanya soal "AI/ML untuk trading",
dibangun sesi/tool berbeda tanpa koordinasi:

| Cluster | Baris | Status nyata | Sudah tersambung? |
|---|---|---|---|
| `services/intelligence/ai/` (prompt, providers, consensus, responseParser) | ~1.500 | Real, matang | ✅ **AKTIF** — AI advisory (OpenAI/Gemini/Claude/DeepSeek) di `engine.ts`, non-blocking |
| `services/ml/` (dataset, features, labeling, models/trainer+predictor) | ~2.800 | Real — logistic regression asli (bukan stub), pure TypeScript (sengaja tanpa TensorFlow, lihat catatan di `trainer.ts`) | ✅ **AKTIF SEBAGIAN** — `mlAdvisor.ts` sudah wired advisory-only ke `engine.ts`. Tapi `/api/ml/train` & `/api/ml/predict` (endpoint dashboard) belum diverifikasi ada yang benar-benar melatih model production. |
| `services/ai/` ("Phase 35" — aiManager, decision/, evaluation/, features/, lifecycle/, optimizer/, pipeline/, prediction/, runtime/, selection/, training/) | ~4.900 | **Belum pernah dievaluasi sesi manapun** (nol referensi di `docs/claude.md`) | ❌ Orphan total, arahnya tidak jelas — dari nama-nama folder ini kelihatan seperti scaffolding untuk pipeline ML/model-lifecycle **generik**, bukan spesifik trading Indodax |

**Rekomendasi konkret:** jangan sentuh `services/ai/` (75 file) sampai kamu putuskan
salah satu dari dua opsi ini:
- **Opsi A (disarankan):** anggap `services/ai/` mati, fokuskan semua energi ke
  memperkuat `services/ml/` + `services/intelligence/ai/` yang sudah terbukti jalan.
  `services/ai/` boleh dihapus kapan saja tanpa risiko (nol importer).
- **Opsi B:** kalau ada alasan spesifik `services/ai/` dianggap lebih baik
  (misal: kamu berencana pipeline model-lifecycle yang lebih canggih — versioning,
  A/B testing model, dst), perlu sesi audit terpisah khusus buat cluster ini
  sebelum sebaris kode pun disambungkan — karena besar & belum diverifikasi sama
  sekali, resiko duplikasi/konflik tipe dengan `ml/` sangat tinggi persis seperti
  kasus `liveTrading/` kemarin.

### Langkah lanjut untuk `services/ml/` (paling bernilai, paling dekat selesai)
1. Verifikasi `/api/ml/train` benar-benar pernah dijalankan sukses di production
   (cek Firestore collection model store) — kalau belum, `mlAdvisor.ts` akan
   selalu `return null` (fail-safe by design, bukan bug).
2. Sambungkan realized PnL dari `engine.ts` (`recordRealizedPnl`) sebagai label
   training buat siklus retraining berikutnya — saat ini dataset collector-nya
   ada (`ml/dataset/collector.ts`) tapi belum dikonfirmasi dapat data trade asli.
3. Tambahkan indikator UI (kapan terakhir prediksi, confidence rata-rata) —
   sudah dicatat sebagai item terbuka di `docs/claude.md` Session Log 10.

---

## 2. Tiga sistem messaging paralel — sama sekali belum dievaluasi

`services/bus/`, `services/events/`, `services/commands/` — total ~4.500 baris,
**tidak saling import satu sama lain**, dan nol mention di `docs/claude.md`.
Pola khas: masing-masing lengkap secara struktur (bus/dispatcher/registry/queue)
tapi tidak ada satupun yang tersambung ke jalur trading aktif (`trading/engine.ts`).

**Kenapa ini butuh keputusan HATI-HATI sebelum diaktifkan:** proyek ini jalan di
Vercel serverless (stateless per-invocation). Event bus / command bus / message
queue in-memory (seperti pola `Map`/array yang berulang kali ditemukan bermasalah
di `liveTrading/`, `paperTrading/`, `rateLimiter.ts` lama) **tidak akan berfungsi**
kalau dipasang apa adanya — perlu backing store persisten (Firestore, atau kalau
skalanya besar, layanan queue eksternal) persis seperti pola yang sudah dipakai
`liveOrderLock.ts`/`botControl.ts`.

**Rekomendasi:** sebelum memilih satu dari tiga, jawab dulu pertanyaan use-case:
- Butuh apa sebenarnya? Kemungkinan besar cuma butuh **decoupling notifikasi**
  (mis. "kalau trade sukses, kirim notifikasi Telegram DAN tulis log DAN update
  metrics — tanpa `live.ts` harus tahu soal ketiganya"). Kalau ya, `services/events/`
  (eventBus.ts v0.2.0, lebih baru & lebih matang dari `bus/`) kemungkinan cukup —
  TIDAK perlu command bus terpisah.
- Butuh command/CQRS pattern penuh (mis. UI mengirim "perintah" yang perlu
  divalidasi-dieksekusi-diaudit sebagai satu unit)? Baru pertimbangkan `commands/`.
- `services/bus/` kemungkinan besar aman dihapus — versinya lebih lama
  (v0.0.7 vs `events/` v0.2.0) dan tidak ada bukti keduanya dipakai bersamaan
  dengan pembagian tanggung jawab yang jelas.

**Jangan aktifkan ketiganya sekaligus** — itu akan menciptakan persis pola
"Known Duplication" yang sudah berkali-kali menyita waktu sesi-sesi sebelumnya.

---

## 3. Urutan kerja yang disarankan (dari risiko terendah)

1. **Verifikasi `services/ml/` end-to-end** (item di atas) — nilai tertinggi,
   risiko rendah (sudah advisory-only, tidak bisa mempengaruhi eksekusi order).
2. **Putuskan nasib `services/ai/`** (hapus, atau audit terpisah) — supaya tidak
   jadi jebakan buat sesi berikutnya yang mengira ini fitur siap pakai.
3. **Pilih SATU sistem messaging** (`events/` direkomendasikan) dan definisikan
   1 use-case konkret dulu (contoh: notifikasi Telegram saat live order
   tereksekusi) sebelum membangun apapun yang lebih besar.
4. Baru pertimbangkan cluster lain yang lebih kecil (`services/orchestration/`,
   `services/pipeline/`, `services/plugins/`) — ini kemungkinan besar generic
   scaffolding yang bahkan belum ada use-case konkretnya di project Indodax ini.

## 4. `services/logger/` stack kedua — dipertahankan sengaja, JANGAN diintegrasikan

Audit (Session Log 14, `docs/claude.md`) mengkonfirmasi 5 file
(`logger.ts`, `consoleLogger.ts`, `fileLogger.ts`, `remoteLogger.ts`,
`logRotation.ts`) adalah stack logger LAMA yang sudah digantikan
`services/logger/index.ts` (aktif, console+Firestore, ~85 importer). Pola sama
seperti `services/liveTrading/`.

- `fileLogger.ts` & `logRotation.ts` pakai `fs.*` sinkron ke direktori lokal —
  **tidak kompatibel Vercel serverless** (filesystem ephemeral) bahkan kalau
  disambungkan.
- `remoteLogger.ts` adalah stub adapter kosong — nol implementasi `fetch`/`http`.
- Keputusan user: **dipertahankan** (bukan dihapus seperti cluster
  `services/trading/{executor,...}` di Session Log 13), untuk kemungkinan
  dipakai lagi di masa depan. Kalau nanti mau diaktifkan: `fileLogger.ts` dan
  `logRotation.ts` WAJIB ditulis ulang dulu targetnya ke Firestore/layanan log
  eksternal, bukan filesystem lokal.

## 4b. `lib/validators/*` — status akhir (Session Log 15)

Dari 12 file yang sempat diminta diintegrasikan, hasil akhirnya:
- ✅ `risk.ts`, `market.ts`, `number.ts` — sudah AKTIF (lewat `api/settings/validate.ts`,
  dan sekarang juga `api/backtest/run.ts`).
- ✅ `env.ts` — sekarang AKTIF, di-wire ke `api/settings/config.ts` sebagai info
  non-blocking (`envStatus`), TIDAK melempar/mem-block endpoint manapun.
- ❌ `api.ts`, `config.ts`, `order.ts`, `pair.ts`, `portfolio.ts`, `scanner.ts`,
  `strategy.ts`, `trade.ts`, `trading.ts` — TETAP orphan dengan sengaja. Alasan
  tertulis lengkap di komentar `api/settings/validate.ts`. Jangan diintegrasikan
  tanpa use-case konkret baru (bukan sekadar "filenya ada") — terutama `pair.ts`
  yang whitelist-nya bentrok langsung dengan scanner all-pair.

Juga ditemukan & dibereskan: `services/backtest/run.ts` (draft duplikat
`pages/api/backtest/run.ts` yang salah lokasi, tidak pernah jadi route aktif) —
perbaikannya (validasi `strategy`) sudah diterapkan ke file asli, draftnya dihapus.

## 5. Isu terbuka dari audit sebelumnya yang lebih mendesak dari semua di atas

Dicatat di `docs/claude.md`, belum diselesaikan:
- 🔴 `ACCOUNT_ENCRYPTION_KEY` (dekripsi API key Indodax semua user) sempat
  tertulis mentah di dokumentasi lama — perlu konfirmasi sudah di-rotate atau belum.
- Duplikasi `bot_control` (Firestore, dibaca `engine.ts` untuk risk-gate) vs
  `bot_settings` (Firestore, diedit slider dashboard, dipakai eksekusi nyata) —
  bisa membuat validasi risk-gate memvalidasi nominal lama sementara eksekusi
  pakai nominal baru dari slider.

Selesaikan dua ini dulu sebelum menambah kompleksitas AI/ML/messaging baru di
atas sistem yang basisnya sendiri belum 100% aman.
