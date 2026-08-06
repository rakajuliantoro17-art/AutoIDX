```typescript id="plugin-validator-ts"
/**
==========================================================
AURA Trade OS
Plugin Validator
Version : 0.3.0 Alpha
==========================================================
Plugin Validation
==========================================================
*/

import type {

    Plugin,

} from "./plugin";





/*
==========================================================
Types
==========================================================
*/

export interface PluginValidationResult {

    valid: boolean;

    errors: string[];

}





/*
==========================================================
Plugin Validator
==========================================================
*/

export class PluginValidator {

    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        plugin: Plugin,

    ): PluginValidationResult {

        const errors:

            string[] = [];





        if (!plugin.id) {

            errors.push(

                "Plugin id is required.",

            );

        }





        if (!plugin.name) {

            errors.push(

                "Plugin name is required.",

            );

        }





        if (!plugin.version) {

            errors.push(

                "Plugin version is required.",

            );

        }





        if (

            plugin.stages.length === 0

        ) {

            errors.push(

                "Plugin must define at least one stage.",

            );

        }





        return {

            valid:

                errors.length === 0,

            errors,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pluginValidator =

    new PluginValidator();
```

