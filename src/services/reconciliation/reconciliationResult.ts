export interface ReconciliationMismatch {
  readonly type:
    | "BALANCE"
    | "POSITION"
    | "ORDER";

  readonly key: string;

  readonly local?: number;

  readonly exchange?: number;

  readonly message: string;
}

export interface ReconciliationResult {
  readonly consistent: boolean;

  readonly mismatches:
    readonly ReconciliationMismatch[];

  readonly reconciledAt: number;
}
