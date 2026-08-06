/**
==========================================================
AURA Trade OS
Service Metadata
Version : 0.3.0 Alpha
==========================================================
Service Metadata Model
==========================================================
*/





/*
==========================================================
Lifecycle
==========================================================
*/

export type ServiceLifecycle =

    | "singleton"

    | "transient"

    | "scoped";





/*
==========================================================
Status
==========================================================
*/

export type ServiceStatus =

    | "registered"

    | "initialized"

    | "running"

    | "stopped"

    | "error";





/*
==========================================================
Metadata
==========================================================
*/

export interface ServiceMetadata {

    id: string;

    name: string;

    version: string;

    description?: string;

    lifecycle:

        ServiceLifecycle;

    status:

        ServiceStatus;

    dependencies:

        string[];

    tags:

        string[];

}

