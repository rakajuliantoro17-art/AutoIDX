import type {
  IntegrationComponent,
  IntegrationCheck,
} from "./integrationTypes";

export class ObservabilityIntegration
  implements IntegrationComponent
{
  readonly name = "observability";

  constructor(
    private readonly observer: {
      health?: () => boolean;
    } = {},
  ) {}

  validate(): IntegrationCheck {
    const passed =
      this.observer.health?.() ?? true;

    return {
      name: "observability",
      passed,
      critical: false,
      message: passed
        ? "Observability available."
        : "Observability degraded.",
    };
  }
}
