/**
==========================================================
AURA Trade OS
Automation Module
Version : 0.0.8 Alpha
==========================================================
*/

/* ======================================================
 * Engine
 * ====================================================== */

export {
  default as automationEngine,
  AutomationEngine,
} from "./engine";

export type {
  AutomationEngineOptions,
  AutomationEngineResult,
} from "./engine";

/* ======================================================
 * Dispatcher
 * ====================================================== */

export {
  default as automationDispatcher,
  AutomationDispatcher,
} from "./dispatcher";

export type {
  DispatchJob,
  DispatchJobType,
  DispatchResult,
} from "./dispatcher";

/* ======================================================
 * Health Monitor
 * ====================================================== */

export {
  default as automationHealth,
  AutomationHealth,
} from "./health";

export type {
  HealthCheck,
  HealthStatus,
  SystemHealth,
} from "./health";

/* ======================================================
 * Future Modules
 * (Phase 5)
 * ====================================================== */

// export {
//   default as automationQueue,
// } from "./queue";

// export {
//   default as automationWorker,
// } from "./worker";

// export {
//   default as automationScheduler,
// } from "./scheduler";

// export {
//   default as automationLifecycle,
// } from "./lifecycle";

// export {
//   default as automationMonitor,
// } from "./monitor";

// export {
//   default as automationNotifier,
// } from "./notifier";
