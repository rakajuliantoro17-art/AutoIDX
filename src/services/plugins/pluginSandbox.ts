/**
==========================================================
AURA Trade OS
Plugin Sandbox
Version : 0.3.0 Alpha
==========================================================
Plugin Sandbox Policy
==========================================================
*/




/*
==========================================================
Types
==========================================================
*/

export type PluginPermission =

    | "network"

    | "filesystem"

    | "database"

    | "exchange"

    | "configuration"

    | "metrics"

    | "logging";





export interface PluginSandboxPolicy {

    readonly permissions:

        readonly PluginPermission[];

}





/*
==========================================================
Plugin Sandbox
==========================================================
*/

export class PluginSandbox {

    private readonly policy:

        PluginSandboxPolicy;





    constructor(

        policy: PluginSandboxPolicy,

    ) {

        this.policy = policy;

    }





    /*
    ======================================================
    Check Permission
    ======================================================
    */

    public canAccess(

        permission:

        PluginPermission,

    ): boolean {

        return this.policy.permissions.includes(

            permission,

        );

    }





    /*
    ======================================================
    Policy
    ======================================================
    */

    public getPolicy():

        PluginSandboxPolicy {

        return this.policy;

    }

}


