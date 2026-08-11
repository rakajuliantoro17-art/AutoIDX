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
  Phase37Runtime,
} from "./phase37Runtime";

export interface Phase37Bootstrap {
  readonly runtime: Phase37Runtime;

  readonly safety: SafetyManager;

  readonly recovery: RecoveryManager;
}

export function createPhase37Runtime(): Phase37Bootstrap {
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
    new Phase37Runtime(
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
