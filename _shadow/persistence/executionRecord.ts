export type ExecutionRecordStatus =
  | "CREATED"
  | "SUBMITTED"
  | "UNKNOWN"
  | "RECONCILED"
  | "FILLED"
  | "PARTIALLY_FILLED"
  | "CANCELLED"
  | "REJECTED";

export interface ExecutionRecord {
  readonly executionId: string;

  readonly signalId: string;

  readonly clientOrderId?: string;

  readonly exchangeOrderId?: string;

  readonly symbol: string;

  readonly side: "BUY" | "SELL";

  readonly requestedQuantity: number;

  readonly filledQuantity: number;

  readonly status: ExecutionRecordStatus;

  readonly createdAt: number;

  readonly updatedAt: number;

  readonly version: number;
}
