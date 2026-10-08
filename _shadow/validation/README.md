# Shadow: validation (tidak terhubung ke jalur live)

Dipindah dari `src/services/validation/` pada 2026-10-08. Di luar build (`tsconfig.exclude` -> `_shadow`).

| File | Baris | Alasan di shadow |
|---|---|---|
| `validationRule.ts` | 1971 | Tidak diimpor siapa pun (statis), termasuk dari dalam folder asalnya |
| `validationRegistry.ts` | 888 | Registry/`Map` global di memori; tidak diimpor siapa pun. Di serverless state hilang tiap instance dingin |
| `validationPipeline.ts` | 74 | Hanya diekspor lewat `index.ts`; tidak ada pemakai |

Yang TETAP aktif di `src/services/validation/`: `schema`, `schemaValidator`, `validationFactory`, `validationManager`, `validator`, `validationContext`, `validationResult`, `invariant`, `primitiveValidator`, `objectValidator`, `arrayValidator` (dipakai `trading/liveOrderValidator`, `trading/liveSellValidator`, `pages/api/backtest/run`).

## Mengaktifkan kembali
1. Pindahkan file ke `src/services/validation/` (impor relatif `./validator` dst. sudah benar di sana).
2. Tambahkan lagi export di `index.ts` bila perlu.
3. Pastikan ada pemakai nyata; jalankan `npx tsc --noEmit`.
