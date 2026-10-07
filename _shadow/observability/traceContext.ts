/**
==========================================================
AURA Trade OS
Trace Context
Version : 0.3.0 Alpha
==========================================================
Tracing Context
==========================================================
*/

import { randomUUID } from "node:crypto";





/*
==========================================================
Types
==========================================================
*/

export interface TraceContext {

    traceId: string;

    correlationId: string;

    currentSpanId?: string;

    parentSpanId?: string;

    startedAt: Date;

    metadata:

        Record<string, unknown>;

}





/*
==========================================================
Trace Context
==========================================================
*/

export class TraceContextManager {

    private context:

        TraceContext | null = null;





    /*
    ======================================================
    Create
    ======================================================
    */

    public create(

        correlationId: string,

    ): TraceContext {

        this.context = {

            traceId:

                randomUUID(),

            correlationId,

            startedAt:

                new Date(),

            metadata: {},

        };



        return this.context;

    }





    /*
    ======================================================
    Current
    ======================================================
    */

    public current():

        TraceContext | null {

        return this.context;

    }





    /*
    ======================================================
    Span
    ======================================================
    */

    public setCurrentSpan(

        spanId: string,

    ): void {

        if (!this.context) {

            return;

        }



        this.context.currentSpanId =

            spanId;

    }





    /*
    ======================================================
    Metadata
    ======================================================
    */

    public set(

        key: string,

        value: unknown,

    ): void {

        if (!this.context) {

            return;

        }



        this.context.metadata[key] =

            value;

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.context = null;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const traceContext =

    new TraceContextManager();
