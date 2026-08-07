/**
==========================================================
AURA Trade OS
Telemetry Exporter
Version : 0.3.0 Alpha
==========================================================
Telemetry Export Contract
==========================================================
*/

import type { TelemetrySnapshot } from "./telemetrySnapshot";

export type TelemetryExportFormat =

    | "json"

    | "protobuf"

    | "messagepack"

    | "otlp";





export interface TelemetryExport {

    readonly format:

        TelemetryExportFormat;





    readonly contentType:

        string;





    readonly payload:

        Uint8Array;

}





export interface TelemetryExporter {

    /*
    ======================================================
    Export
    ======================================================
    */

    export(

        snapshot: TelemetrySnapshot,

    ): Promise<TelemetryExport>;

}


