/**
==========================================================
AURA Trade OS
Pipeline Builder
Version : 0.3.1 Alpha

Perubahan dari 0.3.0: build() sekarang mengisi id (auto-
generate via randomUUID) dan version (default "1.0.0",
bisa di-override lewat setVersion()) -- sebelumnya kedua
field wajib ini tidak pernah diisi sama sekali.
==========================================================
Pipeline Builder
==========================================================
*/
import { randomUUID } from "node:crypto";
import type { Pipeline } from "./pipeline";
import type { PipelineStage } from "./pipelineStage";
/*
==========================================================
Pipeline Builder
==========================================================
*/
export class PipelineBuilder {
    private name = "";
    private version = "1.0.0";
    private readonly stages: PipelineStage[] = [];
    private readonly metadata:
        Record<string, unknown> = {};
    /*
    ======================================================
    Name
    ======================================================
    */
    public setName(
        name: string,
    ): this {
        this.name = name;
        return this;
    }
    /*
    ======================================================
    Version
    ======================================================
    */
    public setVersion(
        version: string,
    ): this {
        this.version = version;
        return this;
    }
    /*
    ======================================================
    Stage
    ======================================================
    */
    public addStage(
        stage: PipelineStage,
    ): this {
        this.stages.push(
            stage,
        );
        return this;
    }
    /*
    ======================================================
    Metadata
    ======================================================
    */
    public setMetadata(
        key: string,
        value: unknown,
    ): this {
        this.metadata[key] = value;
        return this;
    }
    /*
    ======================================================
    Build
    ======================================================
    */
    public build(): Pipeline {
        if (!this.name) {
            throw new Error(
                "Pipeline name is required.",
            );
        }
        return {
            id: randomUUID(),
            name: this.name,
            version: this.version,
            stages: [...this.stages],
            metadata: {
                ...this.metadata,
            },
        };
    }
}
