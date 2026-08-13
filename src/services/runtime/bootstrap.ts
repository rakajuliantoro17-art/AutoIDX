import {
  createSafetyConfig,
} from "../safety/safetyConfig";

import {
  SafetyGate,
} from "../safety/safetyGate";

import {
  SafetyManager,
} from "../safety/safetyManager";

import {
  RecoveryManager,
} from "../recovery/recoveryManager";

import {
  Runtime,
} from "./runtime";

export interface Bootstrap {
  readonly runtime: Runtime;

  readonly safety: SafetyManager;

  readonly recovery: RecoveryManager;
}

export function createRuntime(): Bootstrap {
  const safetyConfig =
    createSafetyConfig();

  const safetyGate =
    new SafetyGate(
      safetyConfig,
    );

  const safety =
    new SafetyManager(
      safetyGate,
    );

  const recovery =
    new RecoveryManager();

  const runtime =
    new Runtime(
      safety,
      recovery,
    );

  runtime.start();

  return Object.freeze({
    runtime,
    safety,
    recovery,
  });
}
