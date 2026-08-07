/**
==========================================================
AURA Trade OS
IP Guard
Version : 0.1.0 Alpha
==========================================================
Network Access Control
==========================================================
*/

import logger from "@/services/logger";

/*
==========================================================
Types
==========================================================
*/

export interface IpValidationResult {

    success: boolean;

    message: string;

}





/*
==========================================================
IP Guard
==========================================================
*/

export class IpGuard {

    private readonly whitelist =

        new Set<string>();



    private readonly blacklist =

        new Set<string>();





    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        ip?: string,

    ): IpValidationResult {

        if (!ip) {

            return {

                success: false,

                message:

                    "IP address is required.",

            };

        }



        if (

            this.blacklist.has(ip)

        ) {

            logger.warn(

                "Blocked IP detected.",

                { ip },

            );



            return {

                success: false,

                message:

                    "IP blocked.",

            };

        }



        if (

            this.whitelist.size > 0 &&

            !this.whitelist.has(ip)

        ) {

            logger.warn(

                "IP not in whitelist.",

                { ip },

            );



            return {

                success: false,

                message:

                    "IP not allowed.",

            };

        }



        return {

            success: true,

            message:

                "IP accepted.",

        };

    }





    /*
    ======================================================
    Whitelist
    ======================================================
    */

    public allow(

        ip: string,

    ): void {

        this.whitelist.add(ip);

    }





    /*
    ======================================================
    Remove Whitelist
    ======================================================
    */

    public removeAllowed(

        ip: string,

    ): void {

        this.whitelist.delete(ip);

    }





    /*
    ======================================================
    Blacklist
    ======================================================
    */

    public block(

        ip: string,

    ): void {

        this.blacklist.add(ip);

    }





    /*
    ======================================================
    Remove Blacklist
    ======================================================
    */

    public unblock(

        ip: string,

    ): void {

        this.blacklist.delete(ip);

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public isBlocked(

        ip: string,

    ): boolean {

        return this.blacklist.has(ip);

    }





    public isAllowed(

        ip: string,

    ): boolean {

        if (

            this.whitelist.size === 0

        ) {

            return true;

        }



        return this.whitelist.has(ip);

    }





    /*
    ======================================================
    Lists
    ======================================================
    */

    public getWhitelist(): string[] {

        return [

            ...this.whitelist,

        ];

    }





    public getBlacklist(): string[] {

        return [

            ...this.blacklist,

        ];

    }





    /*
    ======================================================
    Clear

    Development Only
    ======================================================
    */

    public clear(): void {

        this.whitelist.clear();

        this.blacklist.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const ipGuard =

    new IpGuard();

