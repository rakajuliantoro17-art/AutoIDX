/**
==========================================================
AURA Trade OS
Scheduler Persistence
Version : 0.3.0 Alpha
==========================================================
Scheduler Persistence Contract
==========================================================
*/

export interface SchedulerRecord {

    readonly id: string;

    readonly type: string;

    readonly schedule: string;

    readonly enabled: boolean;

    readonly createdAt: Date;

    readonly updatedAt: Date;

}





export interface SchedulerPersistence {

    /*
    ======================================================
    Save
    ======================================================
    */

    save(

        record: SchedulerRecord,

    ): Promise<void>;





    /*
    ======================================================
    Load
    ======================================================
    */

    load(

        id: string,

    ): Promise<SchedulerRecord | null>;





    /*
    ======================================================
    Delete
    ======================================================
    */

    remove(

        id: string,

    ): Promise<void>;





    /*
    ======================================================
    List
    ======================================================
    */

    list():

        Promise<readonly SchedulerRecord[]>;

}
