/**
==========================================================
AURA Trade OS
Tracing
Version : 0.3.0 Alpha
==========================================================
Tracing Manager
==========================================================
*/

import { randomUUID } from "node:crypto";

import {

    Span,

    type SpanResult,

} from "./span";

import {

    traceContext,

} from "./traceContext";

import {

    traceExporter,

} from "./traceExporter";





/*
==========================================================
Tracing Manager
==========================================================
*/

export class TracingManager {

    private readonly spans:

        SpanResult[] = [];





    /*
    ======================================================
    Start Span
    ======================================================
    */

    public start(

        name: string,

    ): Span {

        const span =

            new Span(

                randomUUID(),

                name,

            );



        traceContext.setCurrentSpan(

            span.id,

        );



        return span;

    }





    /*
    ======================================================
    Finish Span
    ======================================================
    */

    public finish(

        span: Span,

    ): SpanResult {

        const result =

            span.finish();



        this.spans.push(

            result,

        );



        return result;

    }





    /*
    ======================================================
    Export
    ======================================================
    */

    public async export():

        Promise<void> {

        await traceExporter.export(

            this.spans,

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.spans.length = 0;

    }





    /*
    ======================================================
    All
    ======================================================
    */

    public all():

        SpanResult[] {

        return [

            ...this.spans,

        ];

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const tracing =

    new TracingManager();

