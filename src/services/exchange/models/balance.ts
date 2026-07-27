/**
==========================================================
AURA Trade OS
Exchange Balance Model
Version : 0.1.1 Alpha
==========================================================
*/

export interface Balance {

  /**
   * Asset Symbol
   * Example:
   * BTC
   * ETH
   * IDR
   */
  asset: string;

  /**
   * Available balance
   */
  free: number;

  /**
   * Locked balance
   */
  locked: number;

  /**
   * Total balance
   */
  total: number;

  /**
   * Estimated value
   * in account base currency.
   */
  value: number;

}

export interface AccountBalance {

  /**
   * Exchange ID
   */
  exchange: string;

  /**
   * Account ID
   */
  accountId: string;

  /**
   * Base Currency
   * Example:
   * IDR
   * USDT
   */
  baseCurrency: string;

  /**
   * Assets
   */
  balances: Balance[];

  /**
   * Total Portfolio Value
   * in base currency.
   */
  totalValue: number;

  /**
   * Last synchronization
   */
  updatedAt: number;

}
