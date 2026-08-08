/**
==========================================================
AURA Trade OS
Pipeline Manager
Version : 0.3.0 Alpha
==========================================================
Pipeline Orchestrator
==========================================================
*/

import { pipelineRegistry } from "./pipelineRegistry";
import { pipelineExecutor } from "./pipelineExecutor";

import type { Pipeline } from "./pipeline";
import type { PipelineContext } from "./pipelineStage";
import type { PipelineResult } from "./pipelineResult";

export class PipelineManager {

    public register(pipeline: Pipeline): void {
        pipelineRegistry.register(pipeline);
    }

    public async run<T>(
        name: string,
        context: PipelineContext,
    ): Promise<PipelineResult<T>> {

        const pipeline = pipelineRegistry.get(name);

        if (!pipeline) {
            throw new Error(`Pipeline "${name}" not found.`);
        }

        return pipelineExecutor.execute<T>(pipeline, context);

    }

    public list(): Pipeline[] {
        return pipelineRegistry.list();
    }

}

export const pipelineManager =
    new PipelineManager();
