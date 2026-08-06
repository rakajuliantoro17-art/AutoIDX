/**
==========================================================
AURA Trade OS
Telemetry Collector
Version : 0.3.0 Alpha
==========================================================
Telemetry Ingestion Contract
==========================================================
*/

export type TelemetryKind =

    | "metric"

    | "event"

    | "log"

    | "trace";





export interface TelemetryRecord {

    readonly id: string;

    readonly kind: TelemetryKind;

    readonly timestamp: Date;

    readonly data:

        Readonly<Record<string, unknown>>;

}





export interface TelemetryCollector {

    /*
    ======================================================
    Collect
    ======================================================
    */

    collect(

        record: TelemetryRecord,

    ): Promise<void>;





    /*
    ======================================================
    Batch Collect
    ======================================================
    */

    collectMany(

        records: readonly TelemetryRecord[],

    ): Promise<void>;

}

