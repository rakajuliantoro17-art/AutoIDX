/**
 * AURA Trade OS — Phase 35
 */
export interface PaperTradeRecord {
  readonly id: string;
  readonly symbol: string;
  readonly side: "LONG";
  readonly entryPrice: number;
  readonly exitPrice: number;
  readonly quantity: number;
  readonly pnl: number;
  readonly returnPercent: number;
  readonly entryTime: number;
  readonly exitTime: number;
}

export class PaperTradeLog {
  private readonly records: PaperTradeRecord[] = [];

  add(record: PaperTradeRecord): void {
    this.records.push(Object.freeze({ ...record }));
  }

  all(): readonly PaperTradeRecord[] {
    return [...this.records];
  }
}
