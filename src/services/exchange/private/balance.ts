/**
==========================================================
AURA Trade OS
Private Balance Service
Version : 0.1.2 Alpha
==========================================================
*/

import type { IExchangeAdapter } from "../adapters/base";
import type {
  AccountBalance,
  Balance,
} from "../models/balance";

export class BalanceService {

  constructor(
    private readonly adapter: IExchangeAdapter
  ) {}

  /**
   * Returns all balances.
   */
  async getBalance(): Promise<AccountBalance> {
    return this.adapter.getBalance();
  }

  /**
   * Returns one asset balance.
   */
  async getAsset(
    asset: string
  ): Promise<Balance | undefined> {
    const account =
      await this.getBalance();
    return account.balances.find(
      balance =>
        balance.asset.toUpperCase() ===
        asset.toUpperCase()
    );
  }

  /**
   * Returns available balance.
   */
  async getFree(
    asset: string
  ): Promise<number> {
    const balance =
      await this.getAsset(asset);
    return balance?.free ?? 0;
  }

  /**
   * Returns locked balance.
   */
  async getLocked(
    asset: string
  ): Promise<number> {
    const balance =
      await this.getAsset(asset);
    return balance?.locked ?? 0;
  }

  /**
   * Returns total balance.
   */
  async getTotal(
    asset: string
  ): Promise<number> {
    const balance =
      await this.getAsset(asset);
    return balance?.total ?? 0;
  }

  /**
   * Returns total portfolio value.
   */
  async getPortfolioValue(): Promise<number> {
    const account =
      await this.getBalance();
    return account.totalValue;
  }

  /**
   * Returns true when
   * account owns the asset.
   */
  async hasAsset(
    asset: string
  ): Promise<boolean> {
    const balance =
      await this.getAsset(asset);
    return (
      balance !== undefined &&
      balance.total > 0
    );
  }

}

export default BalanceService;
