/**
==========================================================
AURA Trade OS
Audit Logger
Version : 0.1.0 Alpha
==========================================================
Security Audit Trail
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type AuditLevel =

    | "INFO"

    | "WARNING"

    | "ERROR"

    | "CRITICAL";





export type AuditCategory =

    | "AUTH"

    | "SECURITY"

    | "TRADING"

    | "ORDER"

    | "SYSTEM"

    | "CONFIG"

    | "ADMIN";





export interface AuditRecord {

    id: string;

    level: AuditLevel;

    category: AuditCategory;

    action: string;

    actor?: string;

    ip?: string;

    metadata?: Record<string, unknown>;

    timestamp: number;

}





/*
==========================================================
Audit Logger
==========================================================
*/

export class AuditLogger {

    private readonly records:

        AuditRecord[] = [];



    private readonly maxRecords =

        1000;





    /*
    ======================================================
    Write
    ======================================================
    */

    public write(

        level: AuditLevel,

        category: AuditCategory,

        action: string,

        actor?: string,

        metadata?: Record<string, unknown>,

        ip?: string,

    ): AuditRecord {

        const record: AuditRecord = {

            id: crypto.randomUUID(),

            level,

            category,

            action,

            actor,

            ip,

            metadata,

            timestamp: Date.now(),

        };



        this.records.push(record);



        if (

            this.records.length >

            this.maxRecords

        ) {

            this.records.shift();

        }



        logger.info(

            `[AUDIT] ${category}: ${action}`,

            {

                level,

                actor,

                ip,

                ...metadata,

            },

        );



        return record;

    }





    /*
    ======================================================
    Find By Category
    ======================================================
    */

    public byCategory(

        category: AuditCategory,

    ): AuditRecord[] {

        return this.records.filter(

            record =>

                record.category ===

                category,

        );

    }





    /*
    ======================================================
    Find By Level
    ======================================================
    */

    public byLevel(

        level: AuditLevel,

    ): AuditRecord[] {

        return this.records.filter(

            record =>

                record.level ===

                level,

        );

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public history():

        AuditRecord[] {

        return [

            ...this.records,

        ];

    }





    /*
    ======================================================
    Latest
    ======================================================
    */

    public latest(

        limit = 20,

    ): AuditRecord[] {

        return [...this.records]

            .sort(

                (a, b) =>

                    b.timestamp -

                    a.timestamp,

            )

            .slice(0, limit);

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics() {

        return {

            total:

                this.records.length,

            info:

                this.byLevel(

                    "INFO",

                ).length,

            warning:

                this.byLevel(

                    "WARNING",

                ).length,

            error:

                this.byLevel(

                    "ERROR",

                ).length,

            critical:

                this.byLevel(

                    "CRITICAL",

                ).length,

        };

    }





    /*
    ======================================================
    Clear

    Development Only
    ======================================================
    */

    public clear(): void {

        this.records.length = 0;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const auditLogger =

    new AuditLogger();

