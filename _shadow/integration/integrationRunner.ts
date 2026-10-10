import {
  IntegrationManager,
} from "./integrationManager";

import type {
  IntegrationMode,
  IntegrationSnapshot,
} from "./integrationTypes";

export class IntegrationRunner {
  constructor(
    private readonly manager: IntegrationManager,
  ) {}

  async run(
    mode: IntegrationMode,
  ): Promise<IntegrationSnapshot> {
    return this.manager.initialize(mode);
  }

  async stop(): Promise<void> {
    await this.manager.shutdown();
  }
}
