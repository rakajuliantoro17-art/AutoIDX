# Shadow: runtime (proses berumur panjang)

Dipindah dari `src/services/runtime/` pada 2026-10-08. Di luar build (`tsconfig.exclude` -> `_shadow`). Tersimpan untuk kemungkinan pindah ke server fisik/container.

| File | Alasan di shadow |
|---|---|
| `bootstrap.ts`, `runtime.ts`, `health.ts` | State machine di memori (STARTING/READY/HALTED, `errorCount`, waktu rekonsiliasi). Di serverless state hilang tiap instance dingin; yang berlaku di Vercel adalah Firestore (`bot_control`, `system_status/reconciliation`) dan heartbeat cron. Gerbang `canTrade()` bergantung pada `RecoveryManager` yang di kodenya sendiri ditandai stub ("JANGAN pakai untuk keputusan trading sungguhan") |
| `runtimeDiagnostics.ts` | Tumpang tindih dengan `services/health/`; `heapUsageRatio` memakai heapUsed/heapTotal (rumus yang memicu alarm palsu memori, sudah diperbaiki di `memoryHealth.ts`) |
| `runtimeInspector.ts`, `runtimeOptimizer.ts`, `runtimeManager.ts` | Penasihat sederhana yang tidak punya sumber data (metrik tidak pernah diisi) |

## Syarat sebelum diaktifkan di server fisik
1. Aktifkan hanya bila `detectRuntimeEnvironment().capabilities.persistentMemory === true`.
2. Ganti `RecoveryManager` stub dengan implementasi nyata (state dari Firestore), atau hapus ketergantungan itu.
3. Pastikan `health` tetap dibaca dari Firestore sebagai sumber kebenaran, bukan dari memori proses.
4. Pindahkan kembali ke `src/services/runtime/`, perbaiki import relatif, hapus dari `exclude` bila perlu.
