/**
==========================================================
AURA Trade OS
Trading Configuration
Version : 0.0.3 Alpha

Update dari 0.0.1: tambah minVolumeIdr -- ambang batas
volume 24 jam (IDR) yang dipakai untuk menyaring pair mana
saja yang boleh dieksekusi BUY/SELL otomatis oleh cron saat
mode full-pair (BOT_PAIRS tidak diisi manual).

Update dari 0.0.2: default watchlist (dipakai kalau BOT_PAIRS
env var TIDAK diisi) diperluas dari cuma "btc_idr" jadi 10
pair -- supaya bot punya sesuatu yang PASTI diproses tiap
siklus (lewat TRADING_CONFIG.pairs di executeCron(), lihat
services/scheduler/cron.ts) TERLEPAS scanner menemukan
opportunity yang lolos threshold atau tidak. Dipilih berdasar
kapitalisasi pasar & rekam jejak, dikelompokkan kasar per
risiko relatif (BUKAN saran finansial, murni kategori teknis
untuk operator memahami komposisi watchlist):
- Low risk (5): BTC, ETH, BNB, XRP, SOL -- kapitalisasi pasar
  terbesar, volume/likuiditas tertinggi, histori paling lama.
- Medium risk (3): ADA, DOT, AVAX -- proyek established, tapi
  volatilitas & volume umumnya lebih rendah dari 5 di atas.
- High risk/altcoin (2): DOGE, PEPE -- meme coin, volatilitas
  jauh lebih tinggi, pergerakan harga kurang berkorelasi
  dengan fundamental.
Semua 10 dikonfirmasi terdaftar di Indodax per Sep 2026.
==========================================================
*/
export type TradingMode = "paper" | "live";

const DEFAULT_WATCHLIST_PAIRS = [
  // --- Low risk (5) ---
  "btc_idr",
  "eth_idr",
  "bnb_idr",
  "xrp_idr",
  "sol_idr",
  // --- Medium risk (3) ---
  "ada_idr",
  "dot_idr",
  "avax_idr",
  // --- High risk / altcoin (2) ---
  "doge_idr",
  "pepe_idr",
].join(",");

export const TRADING_CONFIG = {
  pair: process.env.BOT_PAIR ?? "btc_idr",
  pairs: (process.env.BOT_PAIRS ?? process.env.BOT_PAIR ?? DEFAULT_WATCHLIST_PAIRS)
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean),

  /**
   * Kalau true (default ketika BOT_PAIRS tidak diisi), cron
   * akan otomatis mengambil SEMUA pair IDR yang lolos filter
   * minVolumeIdr dari scanner, bukan cuma daftar `pairs` di atas.
   *
   * Set BOT_PAIRS secara eksplisit di env untuk memaksa mode
   * manual (daftar pair tetap), atau set BOT_FULL_PAIR_MODE=false
   * untuk menonaktifkan mode dinamis ini walau BOT_PAIRS kosong.
   */
  fullPairMode:
    process.env.BOT_FULL_PAIR_MODE !== undefined
      ? process.env.BOT_FULL_PAIR_MODE === "true"
      : !process.env.BOT_PAIRS,

  /**
   * Ambang batas volume 24 jam (IDR) minimum supaya pair
   * dianggap cukup likuid untuk auto-trading. Pair di bawah
   * ini dilewati sama sekali oleh cron.
   *
   * FIX (503 di Vercel Hobby): sebelumnya 50 juta -- terlalu
   * longgar, ratusan pair kecil lolos ke tahap analisa
   * RSI/EMA per-pair (network call satu-satu ke Indodax,
   * lihat TRADES_CONCURRENCY di services/scanner/index.ts),
   * bikin satu siklus scan >10 detik. Vercel Hobby membatasi
   * KERAS execution time serverless function ke 10 detik
   * apa pun nilai `maxDuration` di kode (config itu cuma
   * berlaku di plan Pro ke atas) -- akibatnya function
   * DIBUNUH PAKSA sebelum sempat menyimpan hasil scan,
   * cron-job.org menerima 503, dan scannerResults/latest
   * tidak pernah ter-update (checklist "Priority Pairs" di
   * dashboard jadi kosong selamanya).
   *
   * Dinaikkan ke 300 juta supaya pair bervolume tipis (yang
   * risikonya juga lebih tinggi untuk auto-trading, bukan
   * cuma soal kecepatan scan) otomatis tersaring lebih awal,
   * mengurangi jumlah pair yang perlu network call per-pair.
   * Override lewat env var BOT_MIN_VOLUME_IDR kalau perlu
   * disesuaikan tanpa redeploy kode.
   */
  minVolumeIdr: Number(process.env.BOT_MIN_VOLUME_IDR ?? 300_000_000),

  defaultTradeAmount: Number(process.env.BOT_DEFAULT_TRADE_AMOUNT ?? 10000),

  maxTradeAmount: Number(process.env.BOT_MAX_TRADE_AMOUNT ?? 25000),

  interval: Number(process.env.BOT_INTERVAL ?? 300),

  mode: (process.env.BOT_MODE as TradingMode) ?? "paper",

  order: {
    type: process.env.ORDER_TYPE ?? "limit",
    minimumAmount: Number(process.env.MIN_ORDER_AMOUNT ?? 10000),
  },

  feePercent: Number(process.env.EXCHANGE_FEE ?? 0.3),
} as const;
