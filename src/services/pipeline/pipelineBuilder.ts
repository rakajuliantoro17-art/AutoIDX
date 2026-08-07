/**
==========================================================
AURA Trade OS
Pipeline Builder
Version : 0.3.0 Alpha
==========================================================
Pipeline Builder
==========================================================
*/

import type { Pipeline } from "./pipeline";
import type { PipelineStage } from "./pipelineStage";





/*
==========================================================
Pipeline Builder
==========================================================
*/

export class PipelineBuilder {

    private name = "";

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

            name: this.name,

            stages: [...this.stages],

            metadata: {

                ...this.metadata,

            },

        };

    }

}


