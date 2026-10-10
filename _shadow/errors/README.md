# Shadow: errors (kelas error domain tak terpakai)

Dipindah dari `src/services/errors/` pada 2026-10-11: `configurationError`, `exchangeError`, `marketError`, `networkError`, `operationalError`, `runtimeError`, `strategyError`, `errorManager`, `errorNormalizer`, `errorRegistry`, `errorSerializer`, `index` (nol importer aktif; tsc bersih setelah dipindah).

Aktif (kanonik, dipakai `trading/engine`, `liveOrderValidator`, `runCycle`, `cron/reconcile`): `error`, `errorCategory`, `errorCode`, `errorContext`, `errorFactory`, `errorHandler`, `errorMetadata`, `errorSeverity`, `riskError`, `validationError`, `legacyErrorAdapter`.

## Empat hierarki error masih hidup (sengaja TIDAK disatukan)
1. `services/errors/*` (kanonik di jalur trading)
2. `src/errors/*` (dipakai `lib/validators/*`, `services/exchange/*`)
3. `src/lib/error/*` (`AppError`, `Logger`; dipakai `mlAdvisor`, `api/*/route`, validator)
4. `services/exchange/errors/*`

`legacyErrorAdapter` sudah menjembatani keempatnya untuk `handleError`. Menyatukan = mengubah puluhan file tanpa perubahan perilaku yang terlihat; risiko regresi > manfaat saat ini. Lakukan bertahap bila ada bug nyata akibat klasifikasi error yang berbeda.

## Syarat aktif kembali
Butuh kelas error domain baru (mis. `NetworkError` untuk retry berbeda): ambil dari sini ke hierarki kanonik, bukan membuat hierarki kelima.
