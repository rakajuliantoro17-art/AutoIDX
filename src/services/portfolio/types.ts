export interface AssetBalance {
  symbol: string;        // Contoh: 'BTC', 'ETH', 'IDR'
  free: number;          // Saldo yang bebas digunakan
  frozen: number;        // Saldo yang sedang tertahan di order book
  total: number;         // Total saldo (free + frozen)
  estimatedIdr: number;  // Estimasi nilai dalam Rupiah
}

export interface PortfolioSummary {
  totalBalanceIdr: number;      // Total estimasi seluruh aset dalam IDR
  idrBalance: number;           // Saldo IDR murni
  cryptoBalanceIdr: number;     // Total nilai koin kripto dalam IDR
  idrRatioPercentage: number;   // Persentase porsi IDR (misal: 60%)
  cryptoRatioPercentage: number;// Persentase porsi Crypto (misal: 40%)
  assets: AssetBalance[];       // Daftar rincian tiap koin
  lastUpdated: string;
}

export interface PositionPnL {
  pair: string;
  buyPrice: number;
  currentPrice: number;
  amount: number;
  costBasisIdr: number;
  currentValueIdr: number;
  pnlIdr: number;
  pnlPercentage: number;
  isProfit: boolean;
}
