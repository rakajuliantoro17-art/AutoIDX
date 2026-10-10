import type {
  IntegrationComponent,
  IntegrationCheck,
} from "./integrationTypes";

export class PersistenceIntegration
  implements IntegrationComponent
{
  readonly name = "persistence";

  constructor(
    private readonly persistence: {
      health?: () => boolean;
    } = {},
  ) {}

  validate(): IntegrationCheck {
    const passed =
      this.persistence.health?.() ?? true;

    return {
      name: "persistence",
      passed,
      critical: true,
      message: passed
        ? "Persistence layer available."
        : "Persistence layer unavailable.",
    };
  }
}
