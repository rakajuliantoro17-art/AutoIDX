import type {
  IntegrationComponent,
  IntegrationCheck,
} from "./integrationTypes";

export class ExecutionIntegration
  implements IntegrationComponent
{
  readonly name = "execution";

  constructor(
    private readonly execution: {
      available?: () => boolean;
    } = {},
  ) {}

  validate(): IntegrationCheck {
    const passed =
      this.execution.available?.() ?? true;

    return {
      name: "execution-engine",
      passed,
      critical: true,
      message: passed
        ? "Execution engine available."
        : "Execution engine unavailable.",
    };
  }
}
