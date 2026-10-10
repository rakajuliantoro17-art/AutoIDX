# Shadow: market (lapisan streaming & orkestrasi)

Dipindah dari `src/services/market/` pada 2026-10-10. Sebelumnya terlihat "aktif" di graf import hanya karena `index.ts` (barrel) diimpor sebagai TIPE oleh `indicator/*` dan `strategy/trendVolumeAdvisor`; saat runtime tidak ada yang memanggilnya.

Tetap aktif di `src/services/market/`: `types.ts`, `aggregators/{candleAggregator,volumeAggregator}`, `filters/{spreadFilter,liquidityFilter}` (dipakai `scanner/marketQuality`), `index.ts` (hanya re-export tipe).

| Kelompok | Alasan disimpan, bukan dihapus |
|---|---|
| `websocket/{indodaxSocket,manager}`, `feeds/*`, `ticker/`, `orderbook/`, `candles/candleBuilder`, `snapshots/*`, `manager`, `registry` | Desain data real-time berbasis koneksi tahan lama. Vercel serverless tidak menahan koneksi/timer, jadi tidak berjalan. Layak bila bot pindah ke VPS/worker (lihat `_shadow/runtime`). |
| `aggregators/{orderBook,trade}Aggregator`, `filters/{volume,volatility}Filter` | Filter kualitas pair tambahan. Scanner kini hanya memakai SpreadFilter sebagai gerbang (satuan threshold Liquidity/Volatility beda dari data scanner, lihat komentar `scanner/marketQuality.ts`). Volume/VolatilityFilter bisa dipasang ke scanner di balik flag setelah satuannya dicocokkan dan hasilnya diuji paper. |
| `*/index.ts` | barrel |

## Syarat aktif kembali
Worker berumur panjang tersedia (untuk streaming), atau, untuk filter, bukti dari paper/backtest bahwa gerbang tambahan memperbaiki hasil. Satu perubahan per langkah.
