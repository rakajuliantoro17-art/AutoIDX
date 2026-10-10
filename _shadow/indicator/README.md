# Shadow: indicator (kerangka indikator berbasis kelas)

Dipindah dari `src/services/indicator/` pada 2026-10-10: 14 file (~6,1 ribu baris), nol importer aktif. Tetap aktif di `src/services/indicator/`: `trend/sma.ts` dan `volume/obv.ts` (dipakai `strategy/trendVolumeAdvisor`).

Indikator yang dipakai jalur live ada di `src/services/indicators/` (jamak). Verifikasi 2026-10-10 terhadap implementasi buku teks (data acak deterministik 200 candle): EMA, RSI (Wilder), ATR (Wilder), Bollinger, Stochastic %K, MACD, dan ADX/±DI **cocok** (selisih hanya pembulatan). Versi kelas di sini (RSI, ATR) menghasilkan angka yang sama persis, jadi tidak ada keunggulan numerik; yang berbeda hanya bentuk API (kelas + `MarketCandle`, label kondisi, registry, manager).

| File | Catatan |
|---|---|
| `momentum/*`, `trend/{ema,adx,macd}`, `volatility/*` | duplikat dari `indicators/*` |
| `signal/signalFusion.ts`, `signal/signalGenerator.ts` | fusi sinyal multi-indikator; konsepnya sudah ada di `strategy/scoring/*` |
| `manager.ts`, `registry.ts`, `types.ts`, `index.ts` | kerangka registrasi indikator; berguna bila kelak ingin indikator plug-in (lihat `_shadow/plugins`) |

## Syarat aktif kembali
Satu jalur saja: pilih salah satu API (fungsi jamak yang aktif atau kelas ini), jangan dua-duanya. Uji silang numerik lagi sebelum mengganti.
