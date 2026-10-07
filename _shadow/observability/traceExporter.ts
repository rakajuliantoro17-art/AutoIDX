/**
==========================================================
AURA Trade OS
Trace Exporter
Version : 0.3.0 Alpha
==========================================================
Trace Export Pipeline
==========================================================
*/

import type {

    SpanResult,

} from "./span";





/*
==========================================================
Types
==========================================================
*/

export interface TraceExporter {

    export(

        spans: SpanResult[],

    ): Promise<void>;

}





/*
==========================================================
Console Exporter
==========================================================
*/

export class ConsoleTraceExporter

    implements TraceExporter {

    public async export(

        spans: SpanResult[],

    ): Promise<void> {

        console.table(

            spans.map(

                span => ({

                    id: span.id,

                    name: span.name,

                    duration: span.duration,

                }),

            ),

        );

    }

}





/*
==========================================================
Trace Export Manager
==========================================================
*/

export class TraceExporterManager {

    private exporter:

        TraceExporter;



    constructor(

        exporter =

            new ConsoleTraceExporter(),

    ) {

        this.exporter = exporter;

    }



    public async export(

        spans: SpanResult[],

    ): Promise<void> {

        await this.exporter.export(

            spans,

        );

    }



    public setExporter(

        exporter: TraceExporter,

    ): void {

        this.exporter = exporter;

    }

}





export const traceExporter =

    new TraceExporterManager();
