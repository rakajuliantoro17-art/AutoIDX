# Shadow: resilience (registry/manager berbasis state memori)

Dipindah dari `src/services/resilience/` pada 2026-10-08. Di luar build (`tsconfig.exclude` -> `_shadow`).

| File | Alasan di shadow |
|---|---|
| `retryRegistry.ts`, `retryManager.ts`, `retryFactory.ts`, `retryContext.ts` | Registry/`Map` global kebijakan retry; di serverless state hilang tiap instance dingin dan tidak dibagi antar-instance. Kebijakan retry cukup dilewatkan sebagai parameter ke `RetryExecutor` |
| `recoveryManager.ts`, `recoveryPolicy.ts`, `recoveryContext.ts` | Orkestrasi pemulihan berbasis state di memori proses; pemulihan nyata di Vercel bertumpu pada Firestore (`liveOrderLock`, status UNCERTAIN, reconcile) |
| `resilienceManager.ts` | Fasad atas registry di atas |
| `index.ts` (lama) | Barrel yang mengekspor semuanya; diganti barrel baru yang hanya mengekspor modul aktif |

## Syarat sebelum diaktifkan di server fisik
1. Aktifkan hanya bila `detectRuntimeEnvironment().capabilities.persistentMemory === true` (`services/runtime`).
2. Pindahkan kembali ke `src/services/resilience/`, perbaiki import relatif.
3. Pastikan keputusan keselamatan trading tetap bersumber dari Firestore, bukan dari state proses.
