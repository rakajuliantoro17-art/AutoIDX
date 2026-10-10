# Shadow: leftovers (1 orphan per folder aktif)

Dipindah pada 2026-10-11. Folder induknya tetap aktif; hanya file ini yang tak dipakai.

| File | Padanan aktif / alasan |
|---|---|
| `audit/auditSerializer` | audit nyata memakai `liveTrading/audit/*` + `firebase/executionAuditSink` |
| `exchange/adapters/indodaxPrivateClient` | klien order live = `liveTrading/exchange/indodaxClient` (skema timestamp+recvWindow); jangan ada klien privat kedua |
| `indicators/bollinger` | duplikat `indicators/bollingerBands.ts` (aktif). Punya tambahan `isBollingerSqueeze`, `calculateStandardDeviation` bila kelak dibutuhkan |
| `reconciliation/reconciliationScheduler`, `recovery/recoveryManager`, `safety/safetyManager` | pengelola in-memory; penjadwalan nyata lewat cron eksternal + `/api/cron/reconcile` |
| `resilience/index`, `validation/index` | barrel tak terpakai (modul diimpor langsung) |
| `scheduler/heartbeat` | heartbeat nyata = `scheduler/cronHeartbeat.ts` (Firestore, dipakai reconcile) |
| `strategy/engine` | mesin strategi kedua; keputusan nyata lewat `trading/engine.ts` + `strategy/*` aktif |

## Syarat aktif kembali
Sama seperti README area terkait: satu jalur saja, uji paper dulu.
