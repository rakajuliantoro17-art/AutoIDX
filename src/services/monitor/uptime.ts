/**
==========================================================
AURA Trade OS
Uptime Monitor
Version : 0.1.0 Alpha
==========================================================
System Uptime Monitoring Service
==========================================================
*/

import logger from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export interface UptimeSnapshot {

    startedAt: number;

    uptimeSeconds: number;

    uptimeMinutes: number;

    uptimeHours: number;

    uptimeDays: number;

    timestamp: number;

}





/*
==========================================================
Uptime Monitor
==========================================================
*/

export class UptimeMonitor {

    private readonly startedAt = Date.now();





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot(): UptimeSnapshot {

        const uptime = process.uptime();

        const snapshot: UptimeSnapshot = {

            startedAt: this.startedAt,

            uptimeSeconds:

                Number(

                    uptime.toFixed(2),

                ),

            uptimeMinutes:

                Number(

                    (uptime / 60).toFixed(2),

                ),

            uptimeHours:

                Number(

                    (uptime / 3600).toFixed(2),

                ),

            uptimeDays:

                Number(

                    (uptime / 86400).toFixed(2),

                ),

            timestamp: Date.now(),

        };

        logger.debug(

            "Uptime snapshot recorded.",

            {

                uptime:

                    snapshot.uptimeSeconds,

            },

        );

        return snapshot;

    }





    /*
    ======================================================
    Seconds
    ======================================================
    */

    public seconds(): number {

        return Number(

            process.uptime().toFixed(2),

        );

    }





    /*
    ======================================================
    Minutes
    ======================================================
    */

    public minutes(): number {

        return Number(

            (

                process.uptime() /

                60

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Hours
    ======================================================
    */

    public hours(): number {

        return Number(

            (

                process.uptime() /

                3600

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Days
    ======================================================
    */

    public days(): number {

        return Number(

            (

                process.uptime() /

                86400

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Format
    ======================================================
    */

    public formatted(): string {

        const totalSeconds =

            Math.floor(

                process.uptime(),

            );

        const days =

            Math.floor(

                totalSeconds / 86400,

            );

        const hours =

            Math.floor(

                (totalSeconds % 86400) /

                3600,

            );

        const minutes =

            Math.floor(

                (totalSeconds % 3600) /

                60,

            );

        const seconds =

            totalSeconds % 60;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;

    }





    /*
    ======================================================
    Started At
    ======================================================
    */

    public getStartedAt(): number {

        return this.startedAt;

    }





    /*
    ======================================================
    Health
    ======================================================
    */

    public healthy(): boolean {

        return process.uptime() >= 0;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const uptimeMonitor =

    new UptimeMonitor();

