/**
==========================================================
AURA Trade OS
Execution Logger
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,

    ExecutionResult,

} from "./types";



export interface ExecutionLog {

    id:string;

    request:ExecutionRequest;

    result:ExecutionResult;

    createdAt:number;

}



export class ExecutionLogger {

    private readonly logs:ExecutionLog[] = [];



    /**
     * Save execution log.
     */
    log(

        request:ExecutionRequest,

        result:ExecutionResult

    ):void{

        const log:ExecutionLog={

            id:

                `LOG-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2,8)
                }`,

            request,

            result,

            createdAt:

                Date.now(),

        };



        this.logs.push(log);

    }



    /**
     * Get all logs.
     */
    getLogs():

        readonly ExecutionLog[]{

        return this.logs;

    }



    /**
     * Latest log.
     */
    latest():

        ExecutionLog|undefined{

        return this.logs.at(-1);

    }



    /**
     * Total logs.
     */
    count():number{

        return this.logs.length;

    }



    /**
     * Clear logs.
     */
    clear():void{

        this.logs.length=0;

    }

}



const executionLogger=

new ExecutionLogger();



export default executionLogger;
