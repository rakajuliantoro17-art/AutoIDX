```typescript
/**
==========================================================
AURA Trade OS
Permission Service
Version : 0.1.0 Alpha
==========================================================
Role Based Access Control (RBAC)
==========================================================
*/

import { logger } from "@/services/logger";

/*
==========================================================
Roles
==========================================================
*/

export type Role =

    | "OWNER"

    | "ADMIN"

    | "TRADER"

    | "VIEWER"

    | "GUEST";

/*
==========================================================
Permissions
==========================================================
*/

export type Permission =

    | "dashboard:view"

    | "portfolio:view"

    | "market:view"

    | "scanner:view"

    | "strategy:edit"

    | "strategy:execute"

    | "paperTrading:execute"

    | "liveTrading:execute"

    | "order:create"

    | "order:cancel"

    | "risk:edit"

    | "settings:edit"

    | "system:restart"

    | "system:shutdown"

    | "admin";

/*
==========================================================
Permission Matrix
==========================================================
*/

const PERMISSIONS:

    Record<Role, Permission[]> = {

    OWNER: [

        "dashboard:view",

        "portfolio:view",

        "market:view",

        "scanner:view",

        "strategy:edit",

        "strategy:execute",

        "paperTrading:execute",

        "liveTrading:execute",

        "order:create",

        "order:cancel",

        "risk:edit",

        "settings:edit",

        "system:restart",

        "system:shutdown",

        "admin",

    ],

    ADMIN: [

        "dashboard:view",

        "portfolio:view",

        "market:view",

        "scanner:view",

        "strategy:edit",

        "strategy:execute",

        "paperTrading:execute",

        "liveTrading:execute",

        "order:create",

        "order:cancel",

        "risk:edit",

        "settings:edit",

        "system:restart",

    ],

    TRADER: [

        "dashboard:view",

        "portfolio:view",

        "market:view",

        "scanner:view",

        "strategy:execute",

        "paperTrading:execute",

        "liveTrading:execute",

        "order:create",

        "order:cancel",

    ],

    VIEWER: [

        "dashboard:view",

        "portfolio:view",

        "market:view",

        "scanner:view",

    ],

    GUEST: [

        "dashboard:view",

    ],

};

/*
==========================================================
Permission Service
==========================================================
*/

export class PermissionService {

    /*
    ======================================================
    Has Permission
    ======================================================
    */

    public has(

        role: Role,

        permission: Permission,

    ): boolean {

        const allowed =

            PERMISSIONS[role] ?? [];

        const granted =

            allowed.includes(permission);

        logger.debug(

            "Permission checked.",

            {

                role,

                permission,

                granted,

            },

        );

        return granted;

    }

    /*
    ======================================================
    Require
    ======================================================
    */

    public require(

        role: Role,

        permission: Permission,

    ): void {

        if (

            !this.has(

                role,

                permission,

            )

        ) {

            throw new Error(

                `Permission denied (${permission})`,

            );

        }

    }

    /*
    ======================================================
    Permissions
    ======================================================
    */

    public permissions(

        role: Role,

    ): Permission[] {

        return [

            ...(PERMISSIONS[role] ??

                []),

        ];

    }

    /*
    ======================================================
    Roles
    ======================================================
    */

    public roles(): Role[] {

        return Object.keys(

            PERMISSIONS,

        ) as Role[];

    }

    /*
    ======================================================
    Is Admin
    ======================================================
    */

    public isAdmin(

        role: Role,

    ): boolean {

        return (

            role === "OWNER" ||

            role === "ADMIN"

        );

    }

    /*
    ======================================================
    Is Trading Allowed
    ======================================================
    */

    public canTrade(

        role: Role,

    ): boolean {

        return this.has(

            role,

            "liveTrading:execute",

        );

    }

    /*
    ======================================================
    Is System Allowed
    ======================================================
    */

    public canShutdown(

        role: Role,

    ): boolean {

        return this.has(

            role,

            "system:shutdown",

        );

    }

}

/*
==========================================================
Singleton
==========================================================
*/

export const permissionService =

    new PermissionService();
```

