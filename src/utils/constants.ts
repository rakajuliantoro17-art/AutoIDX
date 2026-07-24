export const APP_CONSTANTS = {
  APP_NAME: 'AutoIDX Bot',
  VERSION: '1.0.0',
  DEFAULT_PAIR: 'btc_idr',
  DEFAULT_SL_PERCENT: 2.0,
  DEFAULT_TP_PERCENT: 4.0,
  MIN_INDODAX_ORDER_IDR: 10000, // Minimal pembelian di Indodax Rp 10.000
};

export const POPULAR_PAIRS = [
  { pair: 'btc_idr', symbol: 'BTC', name: 'Bitcoin' },
  { pair: 'eth_idr', symbol: 'ETH', name: 'Ethereum' },
  { pair: 'sol_idr', symbol: 'SOL', name: 'Solana' },
  { pair: 'ada_idr', symbol: 'ADA', name: 'Cardano' },
  { pair: 'xrpl_idr', symbol: 'XRP', name: 'Ripple' },
];

export const REFRESH_INTERVALS = {
  TICKER_MS: 5000,    // Refresh harga tiap 5 detik
  LOGS_MS: 3000,      // Refresh log aktivitas tiap 3 detik
  PORTFOLIO_MS: 15000,// Refresh portofolio tiap 15 detik
};
