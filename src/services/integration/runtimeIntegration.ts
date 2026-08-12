import type {
  IntegrationComponent,
  IntegrationCheck,
} from "./integrationTypes";

export interface RuntimeLike {
  canTrade(): boolean;
  snapshot(): unknown;
}

export class RuntimeIntegration
  implements IntegrationComponent
{
  readonly name = "runtime";

  constructor(
    private readonly runtime: RuntimeLike,
  ) {}

  validate(): IntegrationCheck {
    const passed =
      this.runtime.canTrade();

    return {
      name: "runtime-trading-gate",
      passed,
      critical: true,
      message: passed
        ? "Runtime permits trading."
        : "Runtime blocks trading.",
    };
  }
}
