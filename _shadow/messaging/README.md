# Shadow: messaging (events + commands)

Dipindah dari `src/services/events/` (25 file, 3393 baris) dan `src/services/commands/` (19 file, 2082 baris) pada 2026-10-08.
Di luar build (`tsconfig.json` -> `exclude: _shadow`). Tidak ada importer aktif sebelum dipindah. Pulihkan dari git bila perlu.

## Perbedaan semantik
- **events**: fan-out, banyak pelanggan, tanpa balasan (mis. `trading.order.filled` -> log + notifikasi + metrik).
- **commands**: satu handler, mengembalikan hasil.

## Duplikasi antar folder (hasil diff setelah nama dinormalkan)
| Pasangan | Selisih baris | Catatan |
|---|---|---|
| Serializer | 1 | identik, jadikan satu generik |
| Registry | 6 | hampir identik, jadikan `Registry<T>` generik |
| Payload, Priority, Status, Category, Context, Handler, Normalizer, Metadata, Result | 17-32 | tipe pendukung, gabung ke satu basis bersama |
| Middleware, Queue, Dispatcher | 35-50 | gabung bila perilaku sama |

## Nilai yang dipertahankan
- `events/eventTypes.ts`: katalog nama event (SYSTEM/EXCHANGE/TRADING/PORTFOLIO).
- `events/eventBus.ts` (API `subscribe/publish` bertipe) dan `commands/commandBus.ts`.

## Syarat sebelum dipindah balik ke `src/`
1. Bus dibuat **per siklus** (bukan singleton `eventBus`/`eventManager`/`commandManager`); state `Map` hilang tiap cold start di Vercel.
2. Beri timeout per handler dan jalankan paralel (`Promise.allSettled`); sekarang berurutan dengan `await`, handler lambat menahan pemanggil (risiko Fluid Active CPU).
3. Gabungkan duplikasi di atas jadi satu basis generik; hapus API ganda `on/emit` vs `subscribe/publish`.
4. Pasang pertama kali di jalur **non-kritis** (log/notifikasi/metrik setelah trade) dan hanya setelah mode paper; jangan di jalur order live.
5. Perbarui import (`@/services/logger`) dan hapus path ini dari `exclude`.
