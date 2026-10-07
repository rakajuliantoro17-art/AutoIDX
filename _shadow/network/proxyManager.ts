/**
==========================================================
AURA Trade OS
Proxy Manager
Version : 0.3.0 Alpha
==========================================================
Network Proxy Manager
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type ProxyType =

    | "direct"

    | "http"

    | "https";





export interface ProxyConfiguration {

    type: ProxyType;

    host: string;

    port: number;

    enabled: boolean;

}





/*
==========================================================
Proxy Manager
==========================================================
*/

export class ProxyManager {

    private configuration:

        ProxyConfiguration = {

            type: "direct",

            host: "",

            port: 0,

            enabled: false,

        };





    /*
    ======================================================
    Configure
    ======================================================
    */

    public configure(

        configuration:

            ProxyConfiguration,

    ): void {

        this.configuration =

            configuration;



        logger.info(

            "Proxy configuration updated.",

        );

    }





    /*
    ======================================================
    Current
    ======================================================
    */

    public current():

        ProxyConfiguration {

        return {

            ...this.configuration,

        };

    }





    /*
    ======================================================
    Enabled
    ======================================================
    */

    public isEnabled():

        boolean {

        return (

            this.configuration.enabled

        );

    }





    /*
    ======================================================
    Disable
    ======================================================
    */

    public disable():

        void {

        this.configuration.enabled =

            false;



        logger.info(

            "Proxy disabled.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const proxyManager =

    new ProxyManager();

