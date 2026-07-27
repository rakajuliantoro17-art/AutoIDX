/**
==========================================================
AURA Trade OS
Private Authentication Service
Version : 0.1.1 Alpha
==========================================================
*/

import type { ExchangeAdapter } from "../adapters/base";

export interface ExchangeCredential {

  exchange: string;

  apiKey: string;

  apiSecret: string;

  passphrase?: string;

}

export class AuthenticationService {

  constructor(

    private readonly adapter: ExchangeAdapter

  ) {}

  /**
   * Validate current API credential.
   */
  async validate(): Promise<boolean> {

    return this.adapter.validateCredential();

  }

  /**
   * Returns authenticated account id.
   */
  async accountId(): Promise<string> {

    const account =

      await this.adapter.getAccount();

    return account.id;

  }

  /**
   * Returns current exchange id.
   */
  exchange(): string {

    return this.adapter.id;

  }

  /**
   * Returns true if adapter
   * has been authenticated.
   */
  async isAuthenticated(): Promise<boolean> {

    return this.validate();

  }

}

export default AuthenticationService;
