/**
==========================================================
AURA Trade OS
Application Context
Version : 0.2.0 Alpha
==========================================================
Global Runtime Context
==========================================================
*/

import { logger } from "@/services/logger";

/*
==========================================================
Application Mode
==========================================================
*/

export enum ApplicationMode {

    DEVELOPMENT = "development",

    STAGING = "staging",

    PRODUCTION = "production",

}





/*
==========================================================
Trading Mode
==========================================================
*/

export enum TradingMode {

    PAPER = "paper",

    LIVE = "live",

}





/*
==========================================================
Application Context
==========================================================
*/

export class ApplicationContext {

    private readonly startedAt =

        new Date();



    private applicationName =

        "AURA Trade OS";



    private version =

        "0.2.0 Alpha";



    private mode =

        ApplicationMode.DEVELOPMENT;



    private tradingMode =

        TradingMode.PAPER;



    private maintenance =

        false;





    /*
    ======================================================
    Application Name
    ======================================================
    */

    public getApplicationName(): string {

        return this.applicationName;

    }





    /*
    ======================================================
    Version
    ======================================================
    */

    public getVersion(): string {

        return this.version;

    }





    /*
    ======================================================
    Set Version
    ======================================================
    */

    public setVersion(

        version: string,

    ): void {

        this.version = version;

    }





    /*
    ======================================================
    Mode
    ======================================================
    */

    public getMode():

        ApplicationMode {

        return this.mode;

    }





    /*
    ======================================================
    Set Mode
    ======================================================
    */

    public setMode(

        mode: ApplicationMode,

    ): void {

        logger.info(

            `Application mode: ${mode}`,

        );



        this.mode = mode;

    }





    /*
    ======================================================
    Trading Mode
    ======================================================
    */

    public getTradingMode():

        TradingMode {

        return this.tradingMode;

    }





    /*
    ======================================================
    Set Trading Mode
    ======================================================
    */

    public setTradingMode(

        mode: TradingMode,

    ): void {

        logger.info(

            `Trading mode: ${mode}`,

        );



        this.tradingMode = mode;

    }





    /*
    ======================================================
    Maintenance
    ======================================================
    */

    public isMaintenance(): boolean {

        return this.maintenance;

    }





    /*
    ======================================================
    Enable Maintenance
    ======================================================
    */

    public enableMaintenance(): void {

        logger.warn(

            "Maintenance mode enabled.",

        );



        this.maintenance = true;

    }





    /*
    ======================================================
    Disable Maintenance
    ======================================================
    */

    public disableMaintenance(): void {

        logger.info(

            "Maintenance mode disabled.",

        );



        this.maintenance = false;

    }





    /*
    ======================================================
    Uptime
    ======================================================
    */

    public getUptime(): number {

        return (

            Date.now() -

            this.startedAt.getTime()

        );

    }





    /*
    ======================================================
    Started At
    ======================================================
    */

    public getStartedAt(): Date {

        return this.startedAt;

    }





    /*
    ======================================================
    Runtime Information
    ======================================================
    */

    public getRuntime() {

        return {

            node: process.version,

            platform: process.platform,

            arch: process.arch,

            pid: process.pid,

        };

    }





    /*
    ======================================================
    Context Summary
    ======================================================
    */

    public getSummary() {

        return {

            application:

                this.applicationName,

            version:

                this.version,

            mode:

                this.mode,

            tradingMode:

                this.tradingMode,

            maintenance:

                this.maintenance,

            startedAt:

                this.startedAt,

            uptime:

                this.getUptime(),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const applicationContext =

    new ApplicationContext();
