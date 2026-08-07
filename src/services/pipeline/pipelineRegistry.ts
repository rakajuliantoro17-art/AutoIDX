/**
==========================================================
AURA Trade OS
Pipeline Registry
Version : 0.3.0 Alpha
==========================================================
Pipeline Registry
==========================================================
*/

import type { Pipeline } from "./pipeline";





/*
==========================================================
Pipeline Registry
==========================================================
*/

export class PipelineRegistry {

    private readonly pipelines =

        new Map<string, Pipeline>();





    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        pipeline: Pipeline,

    ): void {

        this.pipelines.set(

            pipeline.name,

            pipeline,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        name: string,

    ): Pipeline | undefined {

        return this.pipelines.get(

            name,

        );

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public has(

        name: string,

    ): boolean {

        return this.pipelines.has(

            name,

        );

    }





    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(

        name: string,

    ): boolean {

        return this.pipelines.delete(

            name,

        );

    }





    /*
    ======================================================
    List
    ======================================================
    */

    public list():

        Pipeline[] {

        return [

            ...this.pipelines.values(),

        ];

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.pipelines.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pipelineRegistry =

    new PipelineRegistry();

