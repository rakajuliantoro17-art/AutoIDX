Jangan pernah melewati Risk Layer.

**Order tidak boleh dieksekusi apabila:** confidence di bawah minimum · exposure melebihi batas · position limit terlampaui · saldo tidak cukup · health monitor critical.

---

# Live Trading Safety — WAJIB DIBACA SEBELUM SENTUH KODE EKSEKUSI

Ada **tiga** jalur eksekusi order paralel di codebase ini (hasil kerja beberapa tool AI berbeda tanpa koordinasi):

1. `services/exchange/adapters/indodax.ts` — `placeOrder()` sudah dikunci: menolak eksekusi kecuali `TRADING_CONFIG.mode === "live"`.
2. `services/execution/adapters/indodaxAdapter.ts` — delegasi ke nomor 1.
3. `services/liveTrading/exchange/orderExecutor.ts` — client HTTP terpisah sendiri (`indodaxClient.ts`, langsung ke `https://indodax.com/tapi`). **Sudah ada pengaman mode paper/live juga**, terverifikasi memblokir sebelum request asli terkirim.

**Status saat ini (per audit terakhir):** bot berjalan mode **paper trading**, API key production belum diisi. Kedua jalur di atas yang aktif (1 dan 3) sudah punya pengaman. **Belum ada logic position-sizing yang menghitung dari saldo/exposure asli** — `execution/engine.ts` masih punya `quantity: 0` dengan TODO(SAFETY) di jalur ketiga yang belum tersambung.

**Sebelum mengklaim "live trading siap" ke user:** telusuri end-to-end sendiri, jangan percaya klaim dokumen atau status build-passing saja.

---

# Keamanan — Item Terbuka Prioritas Tinggi

**`src/components/IndodaxAccountManager.tsx` + `src/services/firebase/indodaxAccounts.ts`** (fitur multi-akun: user login → input API key/secret Indodax sendiri) **menyimpan API key & secret KE FIRESTORE DALAM BENTUK POLOS (plaintext)**, langsung dari client-side Firestore SDK di browser. Tidak ada enkripsi AES-256-GCM (padahal itu rencana awal). Tidak ada file `firestore.rules` di repo — aturan keamanan Firestore (kalau ada) hanya ada di Firebase Console, tidak ter-review di git.

**Belum diperbaiki.** Rencana perbaikan: pindahkan alur ke API route server-side (`/api/accounts/indodax`) yang enkripsi dengan master key dari `process.env` sebelum simpan ke Firestore — client tidak pernah kirim key mentah langsung ke Firestore. Plus tulis `firestore.rules` yang benar (`allow read, write: if request.auth.uid == uid;`).

**Kalau API key asli sudah pernah dicoba lewat form ini** (bukan cuma testing kosong), perlakukan seperti insiden `.env.local` sebelumnya — revoke & regenerate dari Indodax.

---

# Known Duplication — Perlu Keputusan Konsolidasi

| Konsep | Implementasi paralel | Status |
|---|---|---|
| Exchange API client | `services/indodax/` (lama, stub) vs `services/exchange/` (scaffolding luas, 44+ file) | `IndodaxAdapter` private ops (`placeOrder`, `getBalance`) sudah terisi (bukan lagi `AdapterNotImplementedError` seperti versi lama) |
| Trading execution | `services/trading/` (aktif, Firebase) vs `services/paperTrading/` (in-memory, TIDAK persisten lintas cold-start) vs `services/liveTrading/` (scaffolding lengkap 15 file/6400 baris, aman tapi belum tersambung ke cron/dispatcher manapun) | Ketiganya hidup berdampingan, belum ada keputusan mana kanonik |
| Strategy execution | `services/strategy/core/strategyEngine.ts` + `strategies/*.ts` (auraTrend, emaCrossover, momentum) — **ini yang tersambung ke `execution/engine.ts`, jalur nyata** | vs `services/strategy/rules/*.ts` (momentumRule, trendRule, volatilityRule, volumeRule) + `StrategyContext` — **orphan total, tidak dipanggil dari manapun**, mirip pola lapisan AI/ML |
| AI/ML layer | `services/ml/` + `services/intelligence/` (~10.000 baris, 63 file) | **Orphan total** — nol import dari luar foldernya sendiri. `ModelTrainer.train()` cuma `sleep(300ms)` + fake success. Tidak ada library ML di `package.json`. |
| Dashboard pages | `src/pages/dashboard/*` (Pages Router — `index.tsx`, `settings.tsx` pakai `IndodaxAccountManager`, lebih matang) vs `src/app/dashboard/{portfolio,scanner,settings}.tsx` (App Router draft, cuma widget statis) | Draft App Router sudah diarsipkan ke `_legacy-pages-reference/app-dashboard-draft/` supaya tidak bentrok build. **Belum diporting dengan benar** — App Router harus tetap kanonik, tapi kontennya perlu diambil dari versi Pages Router yang lebih lengkap. Sidebar link ke `/dashboard/portfolio` dll saat ini akan 404. |
| Portfolio service | `services/portfolio/` sempat diarsipkan sebagai non-kanonik, lalu aktif lagi (regresi dari tool AI lain) | `portfolioRegistry` sudah diperbaiki (kurang named export) |

**Sebelum membuat engine/adapter/service baru untuk konsep yang sudah ada implementasinya (aktif maupun scaffolding), WAJIB cek dulu — kalau ragu, tanya pemilik project sebelum menambah cabang baru.**

---

# Code Quality Rules

- Jangan ubah API publik tanpa alasan.
- Jangan buat duplicate class/interface/folder/engine kalau sudah ada.
- Setiap folder baru di `services/*/` wajib langsung punya `index.ts` barrel saat dibuat.
- Sebelum redefine type/interface: cek dulu `types.ts`, `models/`, `core/` folder terkait.

---

# Build Requirements

Perubahan dianggap selesai apabila:
- TypeScript compile tanpa error
- Next.js build berhasil
- Tidak menambah circular dependency
- Tidak membuat dead code baru
- **Perubahan benar-benar ter-commit ke branch `main`** — verifikasi lewat commit history sebelum melaporkan hasil build (karena workflow ini browser-only, gampang lupa satu file belum di-apply)

---

# AI Assistant Guidelines

- Ikuti struktur proyek yang sudah ada. Gunakan modul yang tersedia sebelum membuat modul baru.
- Kalau perlu refactor besar, jelaskan alasan dan dampaknya SEBELUM mengubah struktur — jangan langsung eksekusi keputusan arsitektur besar secara sepihak.
- Sebelum menulis ulang (regenerate) file dari nol, cek riwayat/versi sebelumnya — regenerasi tanpa referensi berisiko mengembalikan bug yang sudah pernah diperbaiki.
- Jangan asumsikan angka/formula untuk logic yang menyangkut uang (position sizing, risk limit) — cari config yang sudah ada atau tanya pemilik project.
- **Kalau menemukan isu keamanan (kredensial plaintext, key ter-commit, dst): laporkan dulu ke user secara eksplisit sebelum lanjut kerja lain, jangan diam-diam ditambal atau diabaikan.**

---

# Session Log

*(Ringkas, bukan pengganti commit history. Update di akhir tiap sesi build-fix besar.)*

**Sesi build-fix marathon (v0.1.0 Alpha, "Phase 17" audit):**
- Ditemukan: lapisan `services/intelligence/` + `services/ml/` (~10rb baris) orphan total, banyak tipe (`AIRequest`, `FeatureVector`, `MarketContext`, `MarketMomentum`, `FusionDecision`) tidak pernah didefinisikan sama sekali di `types.ts` masing-masing — sudah dilengkapi.
- `services/liveTrading/` (jalur eksekusi order ketiga) diverifikasi: sudah ada pengaman mode paper/live, aman. Bug tipe minor (`symbol`/`side` hilang di return object, `orderId` nullable) sudah diperbaiki.
- `services/market/`: pola bug berulang — order book level (`{price, quantity}`) salah diasumsikan sebagai tuple `[price, volume]` di banyak file (`orderBookAggregator`, `liquidityFilter`, `spreadFilter`, `orderBookSnapshot`). Semua sudah diperbaiki. `Ticker` field name mismatch (`ticker.last`→`lastPrice`, `.open`→`openPrice`, dst) juga diperbaiki.
- `services/strategy/`: ditemukan **dua sistem strategi paralel** dengan kontrak berbeda — (a) `core/strategyEngine.ts` family (dipakai nyata, tersambung ke `execution/engine.ts`) dan (b) `types.ts`+`rules/*.ts` family via `StrategyContext` (orphan total). `StrategyDecision`/`TradeAction` yang didefinisikan ulang di (a) sudah disatukan ke versi kanonik `types.ts`, 5 file disesuaikan. Lapisan (b) — `rules/*.ts` — **belum selesai diperbaiki**, masih ada type error (`RuleResult` belum didefinisikan di `types.ts`), tapi karena orphan total, tidak mendesak.
- File dashboard App Router yang 404 (`portfolio`, `scanner`, `settings` — salah nama, seharusnya `page.tsx` di dalam folder) diarsipkan ke `_legacy-pages-reference/app-dashboard-draft/`. **Belum dibuat ulang dengan benar** dari versi Pages Router yang lebih lengkap.
- Env var mismatch `INDODAX_SECRET` vs `INDODAX_SECRET_KEY` diperbaiki di `src/lib/validators/env.ts`.
- **Temuan keamanan belum diperbaiki:** `IndodaxAccountManager` simpan API key/secret plaintext ke Firestore, tidak ada `firestore.rules` di repo. Lihat bagian "Keamanan" di atas.
- `docs/environment-variables.md` dibuat (dokumentasi nama variabel, bukan file `.env`).

**Status build saat log ini ditulis:** BELUM 100% bersih. Error terakhir: `src/services/strategy/rules/momentumRule.ts:11` — `RuleResult` belum ada di `strategy/types.ts` (bagian dari sistem strategi orphan (b) di atas, lihat "Known Duplication").

**Next step:** lengkapi `RuleResult` + sisa tipe di `strategy/rules/*.ts` (orphan, aman diperbaiki cepat), lanjut sampai `npm run build` 100% bersih, baru commit per-file via GitHub browser.
