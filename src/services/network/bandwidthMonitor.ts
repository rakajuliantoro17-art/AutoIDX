/**
==========================================================
AURA Trade OS
Bandwidth Monitor
Version : 0.3.0 Alpha
==========================================================
Network Throughput Monitor
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface BandwidthSnapshot {

    bytesSent: number;

    bytesReceived: number;

    uploadRate: number;

    downloadRate: number;

    timestamp: Date;

}





/*
==========================================================
Bandwidth Monitor
==========================================================
*/

export class BandwidthMonitor {

    private previous:

        BandwidthSnapshot | null = null;





    /*
    ======================================================
    Capture
    ======================================================
    */

    public capture():

        BandwidthSnapshot {

        /*
        ==============================================
        Future implementation:

        OS Network Interface

        Exchange API Traffic

        WebSocket Traffic

        HTTP Client

        ==============================================
        */

        const snapshot: BandwidthSnapshot = {

            bytesSent: 0,

            bytesReceived: 0,

            uploadRate: 0,

            downloadRate: 0,

            timestamp:

                new Date(),

        };



        this.previous =

            snapshot;



        logger.debug(

            "Bandwidth snapshot captured.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Current
    ======================================================
    */

    public current():

        BandwidthSnapshot | null {

        return this.previous;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.previous = null;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const bandwidthMonitor =

    new BandwidthMonitor();

