export class IntegrationGuard {
  constructor(
    private readonly isReadyFn: () => boolean,
  ) {}

  assertReady(): void {
    if (!this.isReadyFn()) {
      throw new Error(
        "Trading integration is not ready.",
      );
    }
  }

  canProceed(): boolean {
    return this.isReadyFn();
  }
}
