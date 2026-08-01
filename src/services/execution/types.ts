/**
==========================================================
AURA Trade OS
Execution Types
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    StrategyDecision,

} from "@/services/strategy";

/*
==========================================================
Enums
==========================================================
*/

export type ExecutionSide =

    | "BUY"

    | "SELL";



export type ExecutionStatus =

    | "PENDING"

    | "FILLED"

    | "PARTIALLY_FILLED"

    | "CANCELLED"

    | "REJECTED"

    | "FAILED";



export type ExecutionMode =

    | "PAPER"

    | "LIVE"

    | "BACKTEST";



export type OrderType =

    | "MARKET"

    | "LIMIT"

    | "STOP"

    | "STOP_LIMIT";



/*
==========================================================
Core
==========================================================
*/

export interface ExecutionRequest {

    symbol:string;

    side:ExecutionSide;

    quantity:number;

    price?:number;

    stopPrice?:number;

    orderType:OrderType;

    confidence:number;

    strategy?:StrategyDecision;

}



export interface ExecutionResult {

    success:boolean;

    orderId:string | null;

    status:ExecutionStatus;

    executedPrice:number | null;

    executedQuantity:number;

    timestamp:number;

    latency:number;

    exchange:string;

    mode:ExecutionMode;

    message:string;

}



/*
==========================================================
Execution Context
==========================================================
*/

export interface ExecutionContext {

    accountId:string;

    exchange:string;

    mode:ExecutionMode;

}



/*
==========================================================
Execution Adapter
==========================================================
*/

export interface ExecutionAdapter {

    execute(

        request:ExecutionRequest,

        context:ExecutionContext

    ):Promise<ExecutionResult>;



    cancel(

        orderId:string

    ):Promise<boolean>;



    status(

        orderId:string

    ):Promise<ExecutionStatus>;

}



/*
==========================================================
Execution Engine
==========================================================
*/

export interface ExecutionProvider {

    execute(

        request:ExecutionRequest

    ):Promise<ExecutionResult>;

}
