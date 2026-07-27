/**
==========================================================
AURA Trade OS
ML Runtime Loader
Version : 0.1.0 Alpha
==========================================================
*/

import modelRegistry from "../models/registry";

export interface LoaderStatus {

  models:boolean;

  datasets:boolean;

  features:boolean;

  configuration:boolean;

}

export interface LoaderResult {

  success:boolean;

  durationMs:number;

  status:LoaderStatus;

}

export class MLLoader {

  /**
   * Load Runtime Assets
   */
  async load():Promise<LoaderResult>{

    const started=

      performance.now();

    const status:LoaderStatus={

      models:false,

      datasets:false,

      features:false,

      configuration:false

    };

    /**
     * Load Active Model
     */

    const activeModel=

      modelRegistry.getActive();

    if(activeModel){

      status.models=true;

    }

    /**
     * Placeholder
     * Dataset
     */

    status.datasets=true;

    /**
     * Placeholder
     * Feature Config
     */

    status.features=true;

    /**
     * Placeholder
     * Rules / Config
     */

    status.configuration=true;

    const durationMs=

      performance.now()-started;

    return{

      success:

        Object.values(status)

        .every(Boolean),

      durationMs,

      status

    };

  }

}

const mlLoader=

new MLLoader();

export default mlLoader;
