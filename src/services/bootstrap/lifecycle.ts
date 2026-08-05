/**
==========================================================
AURA Trade OS
Lifecycle Manager
Version : 0.2.0 Alpha
==========================================================
Application Lifecycle Management
==========================================================
*/

import { logger } from "@/services/logger";

/*
==========================================================
Lifecycle State
==========================================================
*/

export enum LifecycleState {

    CREATED = "CREATED",

    STARTING = "STARTING",

    RUNNING = "RUNNING",

    MAINTENANCE = "MAINTENANCE",

    STOPPING = "STOPPING",

    STOPPED = "STOPPED",

    RESTARTING = "RESTARTING",

}





/*
==========================================================
Lifecycle Manager
==========================================================
*/

export class LifecycleManager {

    private state =

        LifecycleState.CREATED;





    /*
    ======================================================
    Start
    ======================================================
    */

    public start(): void {

        this.transition(

            LifecycleState.STARTING,

        );



        this.transition(

            LifecycleState.RUNNING,

        );

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public stop(): void {

        this.transition(

            LifecycleState.STOPPING,

        );



        this.transition(

            LifecycleState.STOPPED,

        );

    }





    /*
    ======================================================
    Restart
    ======================================================
    */

    public restart(): void {

        this.transition(

            LifecycleState.RESTARTING,

        );



        this.transition(

            LifecycleState.STARTING,

        );



        this.transition(

            LifecycleState.RUNNING,

        );

    }





    /*
    ======================================================
    Maintenance
    ======================================================
    */

    public maintenance(): void {

        this.transition(

            LifecycleState.MAINTENANCE,

        );

    }





    /*
    ======================================================
    Resume
    ======================================================
    */

    public resume(): void {

        this.transition(

            LifecycleState.RUNNING,

        );

    }





    /*
    ======================================================
    Transition
    ======================================================
    */

    private transition(

        next: LifecycleState,

    ): void {

        logger.info(

            `Lifecycle: ${this.state} -> ${next}`,

        );



        this.state = next;

    }





    /*
    ======================================================
    Current State
    ======================================================
    */

    public getState():

        LifecycleState {

        return this.state;

    }





    /*
    ======================================================
    Running
    ======================================================
    */

    public isRunning(): boolean {

        return (

            this.state ===

            LifecycleState.RUNNING

        );

    }





    /*
    ======================================================
    Maintenance Mode
    ======================================================
    */

    public isMaintenance(): boolean {

        return (

            this.state ===

            LifecycleState.MAINTENANCE

        );

    }





    /*
    ======================================================
    Stopped
    ======================================================
    */

    public isStopped(): boolean {

        return (

            this.state ===

            LifecycleState.STOPPED

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const lifecycle =

    new LifecycleManager();
```

