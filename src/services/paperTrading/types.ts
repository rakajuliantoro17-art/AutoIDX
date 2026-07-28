/**
==========================================================
AURA Trade OS
Paper Trading Types
Version : 0.1.0 Alpha
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

    | "LIMIT"

    | "STOP"

    | "TAKE_PROFIT";




/**
==========================================================
Order Status
==========================================================
*/

export type OrderStatus =

    | "PENDING"

    | "OPEN"

    | "FILLED"

    | "PARTIALLY_FILLED"

    | "CANCELLED"

    | "REJECTED";




/**
==========================================================
Position Side
==========================================================
*/

export type PositionSide =

    | "LONG"

    | "SHORT";




/**
==========================================================
Account Asset
==========================================================
*/

export interface PaperAsset {


    symbol:string;


    quantity:number;


    averagePrice:number;


    currentPrice?:number;


}




/**
==========================================================
Account State
==========================================================
*/

export interface PaperAccountState {


    cash:number;


    equity:number;


    assets:PaperAsset[];


    timestamp:number;

}




/**
==========================================================
Order Request
==========================================================
*/

export interface PaperOrderRequest {


    symbol:string;


    side:TradeSide;


    type:OrderType;


    quantity:number;


    price?:number;


    stopPrice?:number;


    confidence:number;


    timestamp?:number;

}




/**
==========================================================
Paper Order
==========================================================
*/

export interface PaperOrder {


    id:string;


    symbol:string;


    side:TradeSide;


    type:OrderType;


    quantity:number;


    filledQuantity:number;


    price:number;


    status:OrderStatus;


    createdAt:number;


    executedAt?:number;


}




/**
==========================================================
Execution Result
==========================================================
*/

export interface PaperExecutionResult {


    success:boolean;


    orderId:string;


    status:OrderStatus;


    executedPrice:number|null;


    executedQuantity:number;


    fee:number;


    message:string;


    timestamp:number;

}




/**
==========================================================
Trade Record
==========================================================
*/

export interface PaperTrade {


    id:string;


    symbol:string;


    side:TradeSide;


    quantity:number;


    price:number;


    fee:number;


    pnl:number;


    timestamp:number;

}




/**
==========================================================
Market Tick
==========================================================
*/

export interface MarketTick {


    symbol:string;


    price:number;


    volume:number;


    timestamp:number;

}




/**
==========================================================
Position
==========================================================
*/

export interface PaperPosition {


    symbol:string;


    side:PositionSide;


    quantity:number;


    entryPrice:number;


    currentPrice:number;


    unrealizedPnL:number;


}




/**
==========================================================
Trading Signal
==========================================================
*/

export interface PaperSignal {


    symbol:string;


    action:

        | "BUY"

        | "SELL"

        | "HOLD";


    confidence:number;


    quantity:number;


    price:number;


    timestamp:number;

}




/**
==========================================================
Engine Configuration
==========================================================
*/

export interface PaperTradingConfig {


    initialBalance:number;


    baseCurrency:string;


    feePercent:number;


    slippagePercent:number;


    minimumConfidence:number;

}




/**
==========================================================
Performance Snapshot
==========================================================
*/

export interface PaperPerformance {


    totalTrades:number;


    winningTrades:number;


    losingTrades:number;


    winRate:number;


    realizedPnL:number;


    unrealizedPnL:number;


    equity:number;


    timestamp:number;

}




/**
==========================================================
Tracker Event
==========================================================
*/

export type PaperEventType =

    | "ORDER_CREATED"

    | "ORDER_FILLED"

    | "ORDER_CANCELLED"

    | "TRADE_EXECUTED"

    | "BALANCE_UPDATED"

    | "POSITION_UPDATED";




export interface PaperEvent {


    id:string;


    type:PaperEventType;


    payload:unknown;


    timestamp:number;

}
