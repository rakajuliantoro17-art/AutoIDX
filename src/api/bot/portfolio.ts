/**
==========================================================
AutoIDX
Portfolio Manager
Version : 0.0.1 Alpha
==========================================================
*/

export interface AssetBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface Position {
  pair: string;

  side: "BUY" | "SELL";

  entryPrice: number;

  currentPrice: number;

  amountCoin: number;

  amountIdr: number;

  unrealizedPnL: number;

  unrealizedPnLPercent: number;

  openedAt: string;
}

export interface PortfolioSummary {

  totalBalanceIdr: number;

  availableBalanceIdr: number;

  investedBalanceIdr: number;

  unrealizedPnL: number;

  realizedPnL: number;

  winRate: number;

  openPositions: number;

  totalTrades: number;

}

export interface PortfolioState {

  summary: PortfolioSummary;

  balances: AssetBalance[];

  positions: Position[];

}

/**
 * ======================================
 * Temporary Portfolio
 * (Paper Trading)
 * ======================================
 */

export async function getPortfolio(): Promise<PortfolioState> {

  return {

    summary: {

      totalBalanceIdr: 0,

      availableBalanceIdr: 0,

      investedBalanceIdr: 0,

      unrealizedPnL: 0,

      realizedPnL: 0,

      winRate: 0,

      openPositions: 0,

      totalTrades: 0,

    },

    balances: [

      {

        asset: "IDR",

        free: 0,

        locked: 0,

        total: 0,

      }

    ],

    positions: []

  };

}

/**
 * ======================================
 * Position Size
 * ======================================
 */

export function calculatePositionSize(
  balanceIdr: number,
  tradeAmountIdr: number
): number {

  if (balanceIdr <= 0) {

    return 0;

  }

  return Math.min(
    balanceIdr,
    tradeAmountIdr
  );

}

/**
 * ======================================
 * Unrealized Profit
 * ======================================
 */

export function calculateUnrealizedPnL(
  entryPrice: number,
  currentPrice: number,
  amountCoin: number
) {

  return (
    currentPrice -
    entryPrice
  ) * amountCoin;

}

/**
 * ======================================
 * Profit Percentage
 * ======================================
 */

export function calculatePnLPercent(
  entryPrice: number,
  currentPrice: number
) {

  return (
    (
      currentPrice -
      entryPrice
    ) /
    entryPrice
  ) * 100;

}
