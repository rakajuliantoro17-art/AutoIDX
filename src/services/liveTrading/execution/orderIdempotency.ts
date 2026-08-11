export class OrderIdempotency {
  private readonly completed = new Map<string, string>();

  has(key: string): boolean { return this.completed.has(key); }

  record(key: string, exchangeOrderId: string): void {
    if (this.completed.has(key)) throw new Error(`Duplicate idempotency key: ${key}`);
    this.completed.set(key, exchangeOrderId);
  }

  get(key: string): string | undefined { return this.completed.get(key); }
}
