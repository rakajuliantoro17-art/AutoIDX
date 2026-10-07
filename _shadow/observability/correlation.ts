/**
==========================================================
AURA Trade OS
Correlation Context
Version : 0.3.0 Alpha
==========================================================
Observability Correlation Manager
==========================================================
*/

import { randomUUID } from "node:crypto";



/*
==========================================================
Types
==========================================================
*/

export interface CorrelationContext {

    id: string;

    createdAt: Date;

    parentId?: string;

    metadata: Record<string, unknown>;

}





/*
==========================================================
Correlation Manager
==========================================================
*/

export class CorrelationManager {

    private current:

        CorrelationContext | null = null;





    /*
    ======================================================
    Create
    ======================================================
    */

    public create(

        parentId?: string,

    ): CorrelationContext {

        this.current = {

            id: randomUUID(),

            createdAt: new Date(),

            parentId,

            metadata: {},

        };



        return this.current;

    }





    /*
    ======================================================
    Current
    ======================================================
    */

    public currentContext():

        CorrelationContext | null {

        return this.current;

    }





    /*
    ======================================================
    Set Metadata
    ======================================================
    */

    public set(

        key: string,

        value: unknown,

    ): void {

        if (!this.current) {

            return;

        }



        this.current.metadata[key] =

            value;

    }





    /*
    ======================================================
    Get Metadata
    ======================================================
    */

    public get<T>(

        key: string,

    ): T | undefined {

        return this.current

            ?.metadata[key] as

            T | undefined;

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.current = null;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const correlation =

    new CorrelationManager();

