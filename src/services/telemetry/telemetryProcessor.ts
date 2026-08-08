/**
==========================================================
AURA Trade OS
Telemetry Processor
Version : 0.3.0 Alpha
==========================================================
Telemetry Processing Contract
==========================================================
*/

import type { TelemetryRecord } from "./telemetryCollector";
import type { TelemetrySnapshot } from "./telemetrySnapshot";

export interface TelemetryProcessor {

    /*
    ======================================================
    Process
    ======================================================
    */

    process(

        records: readonly TelemetryRecord[],

    ): Promise<TelemetrySnapshot>;

}
