/**
==========================================================
AURA Trade OS
Span
Version : 0.3.0 Alpha
==========================================================
Tracing Span
==========================================================
*/

import { performance } from "node:perf_hooks";





/*
==========================================================
Types
==========================================================
*/

export interface SpanResult {

    id: string;

    name: string;

    startedAt: Date;

    finishedAt: Date;

    duration: number;

    metadata:

        Record<string, unknown>;

}





/*
==========================================================
Span
==========================================================
*/

export class Span {

    private readonly started =

        performance.now();

    private readonly startedAt =

        new Date();



    private readonly metadata:

        Record<string, unknown> = {};





    constructor(

        public readonly id: string,

        public readonly name: string,

    ) {}





    /*
    ======================================================
    Metadata
    ======================================================
    */

    public set(

        key: string,

        value: unknown,

    ): void {

        this.metadata[key] =

            value;

    }





    /*
    ======================================================
    Finish
    ======================================================
    */

    public finish():

        SpanResult {

        return {

            id: this.id,

            name: this.name,

            startedAt:

                this.startedAt,

            finishedAt:

                new Date(),

            duration:

                performance.now() -

                this.started,

            metadata:

                this.metadata,

        };

    }

}
