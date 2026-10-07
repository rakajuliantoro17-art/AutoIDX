# Shadow: observability (tracing)

Dipindah dari `src/services/observability/` pada 2026-10-07. Folder ini **di luar build** (`tsconfig.json` -> `exclude`), jadi tidak ikut `tsc`/`next build` dan tidak dikirim ke Vercel. Isinya disimpan untuk optimasi masa depan.

| File | Alasan di shadow |
|---|---|
| `tracing.ts` | `TracingManager.spans` menumpuk tanpa batas di instance serverless yang tetap hangat (risiko memori) |
| `traceContext.ts`, `correlation.ts` | menyimpan "konteks saat ini" sebagai state global; request bersamaan di satu instance bisa saling menimpa |
| `span.ts` | hanya dipakai `tracing.ts` |
| `traceExporter.ts` | hanya `console.table`, belum ada exporter nyata |
| `profilerReport.ts` | agregasi hasil profiler; belum dibutuhkan (PhaseTimer sudah mencatat per siklus) |

## Syarat sebelum dipindah balik ke `src/`
1. Beri batas ukuran pada `spans` (ring buffer / maksimum N) dan kosongkan di akhir tiap request.
2. Ganti state global dengan `AsyncLocalStorage` atau teruskan konteks lewat parameter.
3. Tambahkan exporter nyata (mis. tulis ringkasan ke Firestore) dan ukur biayanya terhadap kuota Fluid Active CPU.
4. Perbarui `import` relatif dan hapus path ini dari `exclude`.
