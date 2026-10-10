/**
==========================================================
AURA Trade OS
Portfolio Engine Types
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Asset
==========================================================
*/


export interface Asset {


    symbol:string;


    name?:string;


    type:

        | "FIAT"

        | "CRYPTO";



}



/**
==========================================================
Balance
==========================================================
*/


export interface Balance {


    asset:string;



    total:number;



    available:number;



    locked:number;



    updatedAt:number;

}



/**
==========================================================
Balance Update
==========================================================
*/


export interface BalanceUpdate {


    asset:string;


    amount:number;


    reason?:

        | "DEPOSIT"

        | "WITHDRAW"

        | "TRADE"

        | "FEE"

        | "ADJUSTMENT";



}



/**
==========================================================
Portfolio Asset Holding
==========================================================
*/


export interface Holding {


    symbol:string;


    quantity:number;


    averagePrice:number;



    marketValue:number;



    allocation:number;

}



/**
==========================================================
Portfolio Snapshot
==========================================================
*/


export interface PortfolioSnapshot {


    timestamp:number;



    totalEquity:number;



    cashBalance:number;



    investedValue:number;



    unrealizedPnL:number;



    realizedPnL:number;



    holdings:Holding[];

}



/**
==========================================================
Position
==========================================================
*/


export type PositionSide =

    | "LONG"

    | "SHORT";



export type PositionStatus =

    | "OPEN"

    | "CLOSED";



export interface PortfolioPosition {


    id:string;


    symbol:string;



    side:PositionSide;



    status:PositionStatus;



    quantity:number;



    entryPrice:number;



    averagePrice:number;



    openedAt:number;



    closedAt?:number;



}



/**
==========================================================
Trade Record
==========================================================
*/


export type TradeSide =

    | "BUY"

    | "SELL";



export interface TradeRecord {


    id:string;



    symbol:string;



    side:TradeSide;



    quantity:number;



    price:number;



    fee:number;



    timestamp:number;

}



/**
==========================================================
PnL
==========================================================
*/


export interface PnLRecord {


    symbol:string;



    realized:number;



    unrealized:number;



    total:number;



    updatedAt:number;

}



/**
==========================================================
Performance
==========================================================
*/


export interface PerformanceSummary {


    totalTrades:number;



    winRate:number;



    profitFactor:number;



    totalReturn:number;



    totalReturnPercent:number;



    maximumDrawdown:number;



    sharpeRatio:number;

}



/**
==========================================================
Portfolio State
==========================================================
*/


export interface PortfolioState {


    balances:Balance[];



    positions:PortfolioPosition[];



    trades:TradeRecord[];



    snapshot:PortfolioSnapshot;



    performance?:PerformanceSummary;

}



/**
==========================================================
Portfolio Configuration
==========================================================
*/


export interface PortfolioConfig {


    baseCurrency:string;



    initialCapital:number;



    maxExposure:number;



    allowShort:boolean;



    enableTracking:boolean;

}
