/**
==========================================================
AURA Trade OS
Notification Service
Version : 0.1.0 Alpha
==========================================================
Notification Dispatcher
==========================================================
*/

import logger from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export type NotificationLevel =

    | "INFO"

    | "SUCCESS"

    | "WARNING"

    | "ERROR"

    | "CRITICAL";



export interface Notification {

    id: string;

    title: string;

    message: string;

    level: NotificationLevel;

    createdAt: number;

    metadata?: Record<string, unknown>;

}



export interface NotificationChannel {

    send(

        notification: Notification,

    ): Promise<void>;

}





/*
==========================================================
Notification Service
==========================================================
*/

export class NotificationService {

    private readonly channels:

        NotificationChannel[] = [];



    private readonly history:

        Notification[] = [];



    private readonly maxHistory = 500;





    /*
    ======================================================
    Register Channel
    ======================================================
    */

    public register(

        channel: NotificationChannel,

    ): void {

        this.channels.push(channel);

    }





    /*
    ======================================================
    Notify
    ======================================================
    */

    public async notify(

        title: string,

        message: string,

        level: NotificationLevel = "INFO",

        metadata?: Record<string, unknown>,

    ): Promise<void> {

        const notification: Notification = {

            id: crypto.randomUUID(),

            title,

            message,

            level,

            metadata,

            createdAt: Date.now(),

        };



        this.history.push(notification);



        if (

            this.history.length >

            this.maxHistory

        ) {

            this.history.shift();

        }



        logger.info(

            `Notification: ${title}`,

            {

                level,

                ...metadata,

            },

        );



        await Promise.allSettled(

            this.channels.map(

                channel =>

                    channel.send(

                        notification,

                    ),

            ),

        );

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public getHistory():

        Notification[] {

        return [

            ...this.history,

        ];

    }





    /*
    ======================================================
    Latest
    ======================================================
    */

    public latest(

        limit = 20,

    ): Notification[] {

        return [...this.history]

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

        this.history.length = 0;

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics() {

        return {

            total:

                this.history.length,

            channels:

                this.channels.length,

            info:

                this.history.filter(

                    n =>

                        n.level === "INFO",

                ).length,

            success:

                this.history.filter(

                    n =>

                        n.level === "SUCCESS",

                ).length,

            warning:

                this.history.filter(

                    n =>

                        n.level === "WARNING",

                ).length,

            error:

                this.history.filter(

                    n =>

                        n.level === "ERROR",

                ).length,

            critical:

                this.history.filter(

                    n =>

                        n.level === "CRITICAL",

                ).length,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const notificationService =

    new NotificationService();

