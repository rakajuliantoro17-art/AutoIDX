/**
==========================================================
AURA Trade OS
Exchange Account Model
Version : 0.1.1 Alpha
==========================================================
*/

export type ExchangeAccountType =

  | "SPOT"
  | "MARGIN"
  | "FUTURES"
  | "PAPER";

export type ExchangeAccountStatus =

  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "LOCKED"
  | "UNKNOWN";

export interface ExchangePermissions {

  read: boolean;

  trade: boolean;

  withdraw: boolean;

}

export interface ExchangeAccount {

  /**
   * Internal Account ID
   */
  id: string;

  /**
   * Exchange ID
   * Example:
   * indodax
   * binance
   */
  exchange: string;

  /**
   * Display Name
   */
  name: string;

  /**
   * Account Type
   */
  type: ExchangeAccountType;

  /**
   * Current Status
   */
  status: ExchangeAccountStatus;

  /**
   * API Permissions
   */
  permissions: ExchangePermissions;

  /**
   * Base Currency
   */
  baseCurrency: string;

  /**
   * Whether this is the
   * default trading account.
   */
  isDefault: boolean;

  /**
   * Sandbox / Paper
   */
  sandbox: boolean;

  /**
   * Account creation
   */
  createdAt: number;

  /**
   * Last synchronization
   */
  updatedAt: number;

}
