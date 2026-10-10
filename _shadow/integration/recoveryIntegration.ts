import type {
  IntegrationComponent,
  IntegrationCheck,
} from "./integrationTypes";

export class RecoveryIntegration
  implements IntegrationComponent
{
  readonly name = "recovery";

  constructor(
    private readonly recovery: {
      canTrade?: () => boolean;
    },
  ) {}

  validate(): IntegrationCheck {
    const passed =
      this.recovery.canTrade?.() ?? false;

    return {
      name: "recovery-gate",
      passed,
      critical: true,
      message: passed
        ? "Recovery state permits trading."
        : "Recovery state blocks trading.",
    };
  }
}
