/**
==========================================================
AURA Trade OS
Execution Layer
Version : 0.1.0 Alpha
==========================================================
Public Exports
==========================================================
*/

/*
==========================================================
Types
==========================================================
*/

export * from "./types";

/*
==========================================================
Core
==========================================================
*/

export * from "./executionEngine";
export * from "./executionLogger";
export * from "./manager";
export * from "./registry";

/*
==========================================================
Singletons

Catatan: ExecutionEngine & ExecutionManager (executionEngine.ts,
manager.ts) butuh adapter di constructor-nya, jadi tidak bisa
dibuat singleton default di sini -- instantiate manual dengan
adapter pilihan saat benar-benar mau dipakai, contoh:

  import { ExecutionManager } from "@/services/execution";
  import { IndodaxExecutionAdapter } from "@/services/execution/adapters/indodaxAdapter";

  const manager = new ExecutionManager(new IndodaxExecutionAdapter(...));
==========================================================
*/

export {

    default as executionLogger,

} from "./executionLogger";
