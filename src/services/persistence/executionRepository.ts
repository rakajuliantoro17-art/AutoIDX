import type {
  ExecutionRecord,
} from "./executionRecord";

export interface ExecutionRepository {
  get(
    executionId: string,
  ): Promise<ExecutionRecord | null>;

  save(
    record: ExecutionRecord,
  ): Promise<void>;

  update(
    record: ExecutionRecord,
  ): Promise<void>;

  findUnknown():
    Promise<readonly ExecutionRecord[]>;

  findPending():
    Promise<readonly ExecutionRecord[]>;
}
