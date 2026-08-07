/**
==========================================================
AURA Trade OS
Telemetry Manager
Version : 0.3.0 Alpha
==========================================================
Telemetry Orchestrator
==========================================================
*/

import type { TelemetryCollector } from "./telemetryCollector";
import type { TelemetryProcessor } from "./telemetryProcessor";
import type { TelemetryExporter } from "./telemetryExporter";
import type { TelemetryStorage } from "./telemetryStorage";
import type { TelemetryUploader } from "./telemetryUploader";

export class TelemetryManager {

    constructor(

        private readonly collector: TelemetryCollector,

        private readonly processor: TelemetryProcessor,

        private readonly exporter: TelemetryExporter,

        private readonly storage: TelemetryStorage,

        private readonly uploader: TelemetryUploader,

    ) {}

    /*
    ======================================================
    Start
    ======================================================
    */

    public async start(): Promise<void> {

        // initialize telemetry pipeline

    }

    /*
    ======================================================
    Stop
    ======================================================
    */

    public async stop(): Promise<void> {

        // graceful shutdown

    }

    /*
    ======================================================
    Flush
    ======================================================
    */

    public async flush(): Promise<void> {

        // export + upload pending telemetry

    }

}


