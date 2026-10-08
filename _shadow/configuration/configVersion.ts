/**
==========================================================
AURA Trade OS
Configuration Version
Version : 0.3.0 Alpha
==========================================================
Configuration Version Metadata
==========================================================
*/





/*
==========================================================
Types
==========================================================
*/

export interface ConfigVersion {

    version: string;

    schemaVersion: number;

    minimumSupportedVersion: string;

    createdAt: string;

}





/*
==========================================================
Current Version
==========================================================
*/

export const CONFIG_VERSION:

ConfigVersion = {

    version:

        "0.3.0",

    schemaVersion:

        1,

    minimumSupportedVersion:

        "0.3.0",

    createdAt:

        "2026-08-06",

};





/*
==========================================================
Helpers
==========================================================
*/

export function isSupportedVersion(

    version: string,

): boolean {

    return (

        version >=

        CONFIG_VERSION

            .minimumSupportedVersion

    );

}





export function getConfigVersion():

    ConfigVersion {

    return {

        ...CONFIG_VERSION,

    };

}

