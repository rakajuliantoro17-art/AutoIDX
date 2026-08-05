/**
==========================================================
AURA Trade OS
Alert Manager
Version : 0.1.0 Alpha
==========================================================
Centralized Alert Management
==========================================================
*/

import { logger } from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export type AlertLevel =

    | "INFO"

    | "WARNING"

    | "ERROR"

    | "CRITICAL";



export type AlertSource =

    | "SYSTEM"

    | "MARKET"

    | "STRATEGY"

    | "RISK"

    | "LIVE_TRADING"

    | "PAPER_TRADING"

    | "BACKTEST"

    | "DATABASE"

    | "SCHEDULER"

    | "AI";



export interface Alert {

    id: string;

    level: AlertLevel;

    source: AlertSource;

    title: string;

    message: string;

    metadata?: Record<string, unknown>;

    createdAt: number;

}





/*
==========================================================
Alert Manager
==========================================================
*/

export class AlertManager {

    private readonly alerts: Alert[] = [];





    /*
    ======================================================
    Create Alert
    ======================================================
    */

    public create(

        level: AlertLevel,

        source: AlertSource,

        title: string,

        message: string,

        metadata?: Record<string, unknown>,

    ): Alert {

        const alert: Alert = {

            id: crypto.randomUUID(),

            level,

            source,

            title,

            message,

            metadata,

            createdAt: Date.now(),

        };

        this.alerts.push(alert);

        this.dispatch(alert);

        return alert;

    }





    /*
    ======================================================
    Dispatch
    ======================================================
    */

    private dispatch(

        alert: Alert,

    ): void {

        switch (alert.level) {

            case "INFO":

                logger.info(

                    alert.title,

                    {

                        source: alert.source,

                        message: alert.message,

                        ...alert.metadata,

                    },

                );

                break;

            case "WARNING":

                logger.warn(

                    alert.title,

                    {

                        source: alert.source,

                        message: alert.message,

                        ...alert.metadata,

                    },

                );

                break;

            case "ERROR":

            case "CRITICAL":

                logger.error(

                    alert.title,

                    undefined,

                    {

                        source: alert.source,

                        message: alert.message,

                        ...alert.metadata,

                    },

                );

                break;

        }

    }





    /*
    ======================================================
    Get Alerts
    ======================================================
    */

    public getAll(): Alert[] {

        return [...this.alerts];

    }





    /*
    ======================================================
    Get By Level
    ======================================================
    */

    public getByLevel(

        level: AlertLevel,

    ): Alert[] {

        return this.alerts.filter(

            alert =>

                alert.level === level,

        );

    }





    /*
    ======================================================
    Get By Source
    ======================================================
    */

    public getBySource(

        source: AlertSource,

    ): Alert[] {

        return this.alerts.filter(

            alert =>

                alert.source === source,

        );

    }





    /*
    ======================================================
    Latest
    ======================================================
    */

    public latest(

        limit = 10,

    ): Alert[] {

        return [...this.alerts]

            .sort(

                (a, b) =>

                    b.createdAt -

                    a.createdAt,

            )

            .slice(0, limit);

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.alerts.length = 0;

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics() {

        return {

            total:

                this.alerts.length,

            info:

                this.getByLevel(

                    "INFO",

                ).length,

            warning:

                this.getByLevel(

                    "WARNING",

                ).length,

            error:

                this.getByLevel(

                    "ERROR",

                ).length,

            critical:

                this.getByLevel(

                    "CRITICAL",

                ).length,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const alertManager =

    new AlertManager();
```

