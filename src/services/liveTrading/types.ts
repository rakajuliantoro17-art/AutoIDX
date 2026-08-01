/**
==========================================================
AURA Trade OS
Live Trading Types
Version : 0.1.0 Alpha
==========================================================
Shared Type Definitions
==========================================================
*/



/**
==========================================================
Trading Side
==========================================================
*/

export type TradeSide =

    | "BUY"

    | "SELL";





/**
==========================================================
Order Type
==========================================================
*/

export type OrderType =

    | "MARKET"

    | "LIMIT";





/**
==========================================================
Order Status
==========================================================
*/

export type OrderStatus =

    | "PENDING"

    | "OPEN"

    | "PARTIALLY_FILLED"

    | "FILLED"

    | "CANCELLED"

    | "REJECTED";





/**
==========================================================
Engine Status
==========================================================
*/

export type EngineStatus =

    | "STOPPED"

    | "STARTING"

    | "RUNNING"

    | "PAUSED"

    | "ERROR";





/**
==========================================================
Live Order Request
==========================================================
*/

export interface LiveOrderRequest {


    symbol:string;


    side:TradeSide;


    type:OrderType;


    quantity:number;


    price?:number;


}





/**
==========================================================
Live Order
==========================================================
*/

export interface LiveOrder {


    id:string;


    exchangeOrderId?:string;


    symbol:string;


    side:TradeSide;


    type:OrderType;


    quantity:number;


    executedQuantity?:number;


    status:OrderStatus;


    createdAt:number;


    executedAt?:number;


}





/**
==========================================================
Execution Result
==========================================================
*/

export interface LiveExecutionResult {


    success:boolean;


    orderId:string|null;


    symbol:string;


    side:TradeSide;


    status:OrderStatus;


    executedPrice:number|null;


    executedQuantity:number;


    remainingQuantity?:number;


    fee:number;


    message:string;


    timestamp:number;


}





/**
==========================================================
Trade Record
==========================================================
*/

export interface LiveTrade {


    id:string;


    orderId:string;


    symbol:string;


    side:TradeSide;


    quantity:number;


    price:number|null;


    fee:number;


    timestamp:number;


}





/**
==========================================================
Position
==========================================================
*/

export interface LivePosition {


    symbol:string;


    quantity:number;


    entryPrice:number;


    currentPrice:number;


    unrealizedPnL:number;


}





/**
==========================================================
Account State
==========================================================
*/

export interface LiveAccountState {


    balance:number;


    available:number;


    equity:number;


    positions:LivePosition[];


    updatedAt:number;


}

export interface MarketTick {


    symbol:string;


    price:number;


    bid?:number;


    ask?:number;


    volume:number;


    timestamp:number;


}





/**
==========================================================
Risk Request
==========================================================
*/

export interface RiskRequest {


    symbol:string;


    orderValue:number;


    balance:number;


    confidence:number;


}





/**
==========================================================
Risk Decision
==========================================================
*/

export interface RiskDecision {


    approved:boolean;


    reason:string;


    riskScore:number;


    timestamp:number;


}





/**
==========================================================
Exposure Report
==========================================================
*/

export interface ExposureReport {


    totalValue:number;


    ratio:number;


    percentage:number;


    allowed:boolean;


    timestamp:number;


}





/**
==========================================================
Position Limit Result
==========================================================
*/

export interface PositionLimitResult {


    symbol:string;


    currentValue:number;


    futureValue:number;


    percentage:number;


    allowed:boolean;


    reason:string;


    timestamp:number;


}





/**
==========================================================
Exchange Response
==========================================================
*/

export interface ExchangeResponse {


    success:boolean;


    message?:string;


    data:any;


}





/**
==========================================================
Trading Signal
==========================================================
*/

export interface TradingSignal {


    symbol:string;


    action:

        | "BUY"

        | "SELL"

        | "HOLD";


    quantity:number;


    price:number;


    confidence:number;


}





/**
==========================================================
Health Report
==========================================================
*/

export interface HealthReport {


    status:

        | "HEALTHY"

        | "WARNING"

        | "CRITICAL"

        | "OFFLINE";


    exchange:boolean;


    orders:boolean;


    engine:boolean;


    uptime:number;


    issues:string[];


    timestamp:number;


}





/**
==========================================================
Heartbeat State
==========================================================
*/

export interface HeartbeatState {


    status:

        | "ALIVE"

        | "STALE"

        | "DEAD";


    lastBeat:number;


    uptime:number;


    tickCount:number;


}

/**
==========================================================
Exchange Account / Balance
==========================================================
*/

export interface AccountAsset {
    symbol: string;
    available: number;
    locked: number;
}

export interface ExchangeBalance {
    assets: AccountAsset[];
    timestamp: number;
}

export interface MarketCandle {
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}
