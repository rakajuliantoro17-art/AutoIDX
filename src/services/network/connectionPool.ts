/**
==========================================================
AURA Trade OS
Connection Pool
Version : 0.3.0 Alpha
==========================================================
Generic Connection Pool
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface Connection {

    id: string;

    createdAt: Date;

    lastUsed: Date;

    active: boolean;

}





/*
==========================================================
Connection Pool
==========================================================
*/

export class ConnectionPool {

    private readonly pool =

        new Map<

            string,

            Connection

        >();





    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        connection: Connection,

    ): void {

        this.pool.set(

            connection.id,

            connection,

        );



        logger.debug(

            `Connection registered: ${connection.id}`,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        id: string,

    ): Connection | undefined {

        const connection =

            this.pool.get(

                id,

            );



        if (connection) {

            connection.lastUsed =

                new Date();

        }



        return connection;

    }





    /*
    ======================================================
    Release
    ======================================================
    */

    public release(

        id: string,

    ): void {

        this.pool.delete(

            id,

        );



        logger.debug(

            `Connection released: ${id}`,

        );

    }





    /*
    ======================================================
    Active
    ======================================================
    */

    public active():

        Connection[] {

        return Array.from(

            this.pool.values(),

        ).filter(

            connection =>

                connection.active,

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.pool.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const connectionPool =

    new ConnectionPool();
```

