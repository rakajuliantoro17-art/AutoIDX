/**
==========================================================
AURA Trade OS
Plugin Lifecycle
Version : 0.3.0 Alpha
==========================================================
Plugin Lifecycle State Machine
==========================================================
*/




/*
==========================================================
States
==========================================================
*/

export type PluginLifecycleState =

    | "installed"

    | "initialized"

    | "running"

    | "stopped"

    | "disposed";





/*
==========================================================
Lifecycle
==========================================================
*/

export class PluginLifecycle {

    private state:

        PluginLifecycleState =

        "installed";





    /*
    ======================================================
    State
    ======================================================
    */

    public getState():

        PluginLifecycleState {

        return this.state;

    }





    /*
    ======================================================
    Initialize
    ======================================================
    */

    public initialize(): void {

        this.ensure(

            "installed",

        );



        this.state =

            "initialized";

    }





    /*
    ======================================================
    Start
    ======================================================
    */

    public start(): void {

        this.ensure(

            "initialized",

        );



        this.state =

            "running";

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public stop(): void {

        this.ensure(

            "running",

        );



        this.state =

            "stopped";

    }





    /*
    ======================================================
    Dispose
    ======================================================
    */

    public dispose(): void {

        this.ensure(

            "stopped",

        );



        this.state =

            "disposed";

    }





    /*
    ======================================================
    Validate Transition
    ======================================================
    */

    private ensure(

        expected:

        PluginLifecycleState,

    ): void {

        if (

            this.state !== expected

        ) {

            throw new Error(

                `Invalid lifecycle transition. Expected "${expected}", current "${this.state}".`,

            );

        }

    }

}


