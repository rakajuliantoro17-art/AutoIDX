export class IntegrationError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(
    message: string,
    code = "INTEGRATION_ERROR",
    cause?: unknown,
  ) {
    super(message);

    this.name = "IntegrationError";
    this.code = code;
    this.cause = cause;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}
