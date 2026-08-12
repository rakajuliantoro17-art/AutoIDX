import type {
  IntegrationComponent,
} from "./integrationTypes";

export class IntegrationRegistry {
  private readonly components =
    new Map<string, IntegrationComponent>();

  register(
    component: IntegrationComponent,
  ): void {
    if (
      this.components.has(component.name)
    ) {
      throw new Error(
        `Integration component already registered: ${component.name}`,
      );
    }

    this.components.set(
      component.name,
      component,
    );
  }

  get(
    name: string,
  ): IntegrationComponent | undefined {
    return this.components.get(name);
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  list(): readonly IntegrationComponent[] {
    return Object.freeze(
      Array.from(this.components.values()),
    );
  }

  clear(): void {
    this.components.clear();
  }
}
