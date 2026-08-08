/**
==========================================================
AURA Trade OS
Telemetry Storage
Version : 0.3.0 Alpha
==========================================================
Telemetry Storage Contract
==========================================================
*/

export interface TelemetryStoredRecord {

    readonly id: string;

    readonly payload: Uint8Array;

    readonly createdAt: Date;

}

export interface TelemetryStorage {

    /*
    ======================================================
    Save
    ======================================================
    */

    save(

        record: TelemetryStoredRecord,

    ): Promise<void>;

    /*
    ======================================================
    Read Pending
    ======================================================
    */

    pending():
    Promise
        readonly TelemetryStoredRecord[]
    >;

    /*
    ======================================================
    Remove
    ======================================================
    */

    remove(

        id: string,

    ): Promise<void>;

    /*
    ======================================================
    Clear
    ======================================================
    */

    clear():

        Promise<void>;

    /*
    ======================================================
    Count
    ======================================================
    */

    count():

        Promise<number>;

}
