/**
==========================================================
AURA Trade OS
Private Account Service
Version : 0.1.1 Alpha
==========================================================
*/

import type { ExchangeAdapter } from "../adapters/base";

import type { ExchangeAccount } from "../models/account";
import type { AccountBalance } from "../models/balance";

export class AccountService {

  constructor(

    private readonly adapter: ExchangeAdapter

  ) {}

  /**
   * Returns account profile.
   */
  async getAccount(): Promise<ExchangeAccount> {

    return this.adapter.getAccount();

  }

  /**
   * Returns current balances.
   */
  async getBalance(): Promise<AccountBalance> {

    return this.adapter.getBalance();

  }

  /**
   * Returns account status.
   */
  async getStatus(): Promise<string> {

    const account =

      await this.getAccount();

    return account.status;

  }

  /**
   * Checks whether
   * trading is allowed.
   */
  async canTrade(): Promise<boolean> {

    const account =

      await this.getAccount();

    return (

      account.status === "ACTIVE"

      &&

      account.permissions.trade

    );

  }

  /**
   * Checks whether
   * withdrawal is allowed.
   */
  async canWithdraw(): Promise<boolean> {

    const account =

      await this.getAccount();

    return account.permissions.withdraw;

  }

  /**
   * Checks whether
   * account has read permission.
   */
  async canRead(): Promise<boolean> {

    const account =

      await this.getAccount();

    return account.permissions.read;

  }

}

export default AccountService;
