import {
  INTEGRATION_EVENTS,
} from "./integrationEvents";

export interface EventPublisher {
  publish(
    event: string,
    payload: unknown,
  ): void | Promise<void>;
}

export class IntegrationEventBridge {
  constructor(
    private readonly publisher?: EventPublisher,
  ) {}

  publishReady(
    payload: unknown,
  ): void | Promise<void> {
    return this.publisher?.publish(
      INTEGRATION_EVENTS.READY,
      payload,
    );
  }

  publishFailed(
    payload: unknown,
  ): void | Promise<void> {
    return this.publisher?.publish(
      INTEGRATION_EVENTS.FAILED,
      payload,
    );
  }
}
