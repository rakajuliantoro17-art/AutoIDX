/**
==========================================================
AURA Trade OS
AI Model Lifecycle Layer
Phase 32
==========================================================
*/

export {
    createModelArtifact,
} from "./modelArtifact";

export type {
    ModelArtifact,
    ModelArtifactType,
} from "./modelArtifact";

export {
    createModelVersion,
    compareModelVersions,
    isNewerModelVersion,
} from "./modelVersion";

export type {
    ModelVersion,
} from "./modelVersion";

export {
    createModelMetadata,
} from "./modelMetadata";

export type {
    ModelMetadata,
} from "./modelMetadata";

export {
    isUsableModelStatus,
    canTransitionModelStatus,
} from "./modelStatus";

export type {
    ModelStatus,
} from "./modelStatus";

export {
    createModelLifecycle,
} from "./modelLifecycle";

export type {
    ModelLifecycle,
} from "./modelLifecycle";

export {
    ModelLifecycleManager,
    modelLifecycleManager,
} from "./modelLifecycleManager";

export {
    ModelLifecycleRegistry,
    modelLifecycleRegistry,
} from "./modelLifecycleRegistry";
