# Shadow: network (DNS resolver, proxy)

Disimpan 2026-10-08; folder `src/services/network/` lainnya dihapus (lihat di bawah). Di luar build (`tsconfig.exclude` -> `_shadow`).

| File | Potensi masa depan |
|---|---|
| `dnsResolver.ts` | `dns.lookup` + cache TTL. Bermakna di server fisik bila ingin resolver/cache sendiri; di serverless tidak terhubung ke `fetch`, jadi tidak berefek |
| `proxyManager.ts` | Pemegang konfigurasi proxy (host/port/type). BELUM menerapkan proxy ke request apa pun. Dapat jadi dasar bila API key Indodax di-whitelist IP dan harus keluar lewat proxy IP tetap (di Vercel IP keluar dinamis) |

## Syarat sebelum diaktifkan
1. Hubungkan nyata ke klien HTTP (mis. undici `ProxyAgent` / `setGlobalDispatcher`), lalu uji dengan request Indodax publik.
2. Aktifkan hanya bila relevan: `detectRuntimeEnvironment()` di `services/runtime`.

## Dihapus (bisa dipulihkan dari git, commit sebelum ini)
`bandwidthMonitor` (mengembalikan angka 0 tetap), `connectionPool` (pencatat `Map`, bukan pool koneksi), `networkManager`/`networkMetrics` (agregator atas yang di atas), `latencyMonitor` (duplikat `services/monitor/latencyMonitor` yang aktif), `networkHealth` (duplikat `services/health/checks/networkHealth`), `retryPolicy` (duplikat `services/resilience/retryExecutor`), `index.ts`.
