# Shadow: liveTrading (desain paralel yang tidak terpakai)

Dipindah dari `src/services/liveTrading/` pada 2026-10-10: **72 file (~9,6 ribu baris), nol importer aktif**. Jalur live nyata ada di `src/services/trading/live.ts` (+ `firebase/liveOrderLock`, `trading/liveOrderValidator`, kanari `liveTrading/monitoring/*`, `liveTrading/exchange/indodaxClient`). Hanya 8 file liveTrading yang tetap aktif di `src/` (audit, exchange/indodaxClient, monitoring/canaryMetrics+canaryStore, risk/liveTradingConfig, types, reconciliation/uncertainOrderReconciler).

| Sub-folder | Padanan aktif | Catatan nilai masa depan |
|---|---|---|
| `gate/` (killSwitch, duplicateOrderGuard, idempotencyKey/Store, uncertainExecutionGuard, liveApproval, liveOrderGate, liveTradingGuard) | `emergencyStop` (bot_control), `liveOrderLock` (Firestore, UNCERTAIN), `BOT_LIVE_CONFIRM` | `liveApproval` (persetujuan manusia per order/ambang nominal) layak dipertimbangkan bila ukuran posisi dinaikkan |
| `execution/` (preflight, supervisor, verifier, reconciler, orderTracker, fillHandler, dryRun, ...) | `trading/live.ts`, `liveOrderValidator` | `executionPreflight` + `executionVerifier` (cek saldo/minimum order sebelum kirim, verifikasi isi order sesudah) kandidat hardening |
| `canary/` | `monitoring/canaryMetrics`, `canaryStore` (aktif) | duplikat konsep |
| `exchange/`, `engine/`, `monitor/`, `risk/`, `persistence/`, `reconciliation/` | `exchange/*`, `trading/risk`, `reconciliation/*` | `risk/positionLimit` dan `monitor/*` dapat dibandingkan saat audit risiko |

## Syarat aktivasi (aturan keras untuk jalur uang nyata)
1. Aktifkan hanya per fitur, di balik feature flag Firestore (`bot_control/flags`), mulai dari mode paper.
2. Tidak ada modul di sini yang boleh menggantikan `liveOrderLock` / `BOT_LIVE_CONFIRM`; boleh hanya menambah lapisan pengaman (fail-closed).
3. Uji dengan klien bursa tiruan sebelum menyentuh `trading/live.ts`.
