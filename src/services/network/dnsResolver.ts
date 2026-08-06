/**
==========================================================
AURA Trade OS
DNS Resolver
Version : 0.3.0 Alpha
==========================================================
DNS Resolution Service
==========================================================
*/

import dns from "node:dns/promises";

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface DnsRecord {

    hostname: string;

    address: string;

    family: number;

    resolvedAt: Date;

}





/*
==========================================================
DNS Resolver
==========================================================
*/

export class DnsResolver {

    private readonly cache =

        new Map<

            string,

            DnsRecord

        >();





    /*
    ======================================================
    Resolve
    ======================================================
    */

    public async resolve(

        hostname: string,

    ): Promise<DnsRecord> {

        const cached =

            this.cache.get(

                hostname,

            );



        if (cached) {

            return cached;

        }



        const result =

            await dns.lookup(

                hostname,

            );



        const record: DnsRecord = {

            hostname,

            address:

                result.address,

            family:

                result.family,

            resolvedAt:

                new Date(),

        };



        this.cache.set(

            hostname,

            record,

        );



        logger.debug(

            `Resolved ${hostname} -> ${record.address}`,

        );



        return record;

    }





    /*
    ======================================================
    Cached
    ======================================================
    */

    public cached(

        hostname: string,

    ): DnsRecord | undefined {

        return this.cache.get(

            hostname,

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.cache.clear();

    }





    /*
    ======================================================
    Cache Size
    ======================================================
    */

    public size(): number {

        return this.cache.size;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const dnsResolver =

    new DnsResolver();

