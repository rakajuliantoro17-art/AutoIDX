import type {
  ExecutionRepository,
} from "./executionRepository";

import type {
  OrderRepository,
} from "./orderRepository";

import type {
  PositionRepository,
} from "./positionRepository";

export interface PersistenceManager {
  readonly executions:
    ExecutionRepository;

  readonly orders:
    OrderRepository;

  readonly positions:
    PositionRepository;
}

export class DefaultPersistenceManager
  implements PersistenceManager {

  constructor(
    public readonly executions:
      ExecutionRepository,

    public readonly orders:
      OrderRepository,

    public readonly positions:
      PositionRepository,
  ) {}
}
