/**
==========================================================
AURA Trade OS
Execution Manager
Version : 0.1.0 Alpha
==========================================================
*/

import ExecutionEngine, {

    type ExecutionRequest,

    type ExecutionResult,

} from "./executionEngine";

import ExecutionLogger from "./executionLogger";



export class ExecutionManager {

    /**
     * Execute trading request.
     */
    async execute(

        request: ExecutionRequest

    ): Promise<ExecutionResult> {

        const result =

            await ExecutionEngine.execute(

                request

            );

        ExecutionLogger.log(

            request,

            result

        );

        return result;

    }



    /**
     * Latest execution log.
     */
    latest() {

        return ExecutionLogger.latest();

    }



    /**
     * All execution logs.
     */
    history() {

        return ExecutionLogger.getLogs();

    }



    /**
     * Total execution count.
     */
    totalExecutions(): number {

        return ExecutionLogger.count();

    }



    /**
     * Clear execution history.
     */
    clearHistory(): void {

        ExecutionLogger.clear();

    }

}



const executionManager =

    new ExecutionManager();



export default executionManager;
