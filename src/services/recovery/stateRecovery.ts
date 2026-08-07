/**
==========================================================
AURA Trade OS
State Recovery
Version : 0.1.0 Alpha
==========================================================
Runtime State Recovery Service
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface RuntimeState {

    tradingEnabled: boolean;

    paperTradingEnabled: boolean;

    liveTradingEnabled: boolean;

    strategy: string;

    activePair: string;

    lastSignal?: string;

    lastOrderId?: string;

    metadata?: Record<string, unknown>;

    updatedAt: number;

}





export interface RecoveryStateResult {

    success: boolean;

    timestamp: number;

    message: string;

}





/*
==========================================================
State Recovery
==========================================================
*/

export class StateRecovery {

    private state: RuntimeState = {

        tradingEnabled: true,

        paperTradingEnabled: true,

        liveTradingEnabled: false,

        strategy: "DEFAULT",

        activePair: "btc_idr",

        updatedAt: Date.now(),

    };





    /*
    ======================================================
    Save
    ======================================================
    */

    public save(

        state: Partial<RuntimeState>,

    ): RecoveryStateResult {

        this.state = {

            ...this.state,

            ...state,

            updatedAt: Date.now(),

        };



        logger.info(

            "Runtime state saved.",

            this.state,

        );



        return {

            success: true,

            timestamp: Date.now(),

            message:

                "Runtime state saved successfully.",

        };

    }





    /*
    ======================================================
    Restore
    ======================================================
    */

    public restore(): RuntimeState {

        logger.info(

            "Runtime state restored.",

        );



        return {

            ...this.state,

        };

    }





    /*
    ======================================================
    Current
    ======================================================
    */

    public current(): RuntimeState {

        return {

            ...this.state,

        };

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): RecoveryStateResult {

        this.state = {

            tradingEnabled: true,

            paperTradingEnabled: true,

            liveTradingEnabled: false,

            strategy: "DEFAULT",

            activePair: "btc_idr",

            updatedAt: Date.now(),

        };



        logger.warn(

            "Runtime state reset.",

        );



        return {

            success: true,

            timestamp: Date.now(),

            message:

                "Runtime state reset successfully.",

        };

    }





    /*
    ======================================================
    Enable Trading
    ======================================================
    */

    public enableTrading(): void {

        this.state.tradingEnabled = true;

        this.state.updatedAt = Date.now();

    }





    /*
    ======================================================
    Disable Trading
    ======================================================
    */

    public disableTrading(): void {

        this.state.tradingEnabled = false;

        this.state.updatedAt = Date.now();

    }





    /*
    ======================================================
    Update Pair
    ======================================================
    */

    public updatePair(

        pair: string,

    ): void {

        this.state.activePair = pair;

        this.state.updatedAt = Date.now();

    }





    /*
    ======================================================
    Update Strategy
    ======================================================
    */

    public updateStrategy(

        strategy: string,

    ): void {

        this.state.strategy = strategy;

        this.state.updatedAt = Date.now();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const stateRecovery =

    new StateRecovery();

