/**
==========================================================
AURA Trade OS
Backtest Engine Types
Version : 0.1.0 Alpha
==========================================================
Central Backtest Data Contracts
==========================================================
*/





/*
==========================================================
Market Candle
==========================================================
*/


export interface BacktestCandle {


    timestamp:number;


    open:number;


    high:number;


    low:number;


    close:number;


    volume:number;


    pair:string;


}









/*
==========================================================
Backtest Configuration
==========================================================
*/


export interface BacktestConfig {


    pair:string;



    timeframe:string;



    startTime:number;



    endTime:number;



    initialCapital:number;



    feeRate:number;



    slippage:number;



    strategy:string;



}









/*
==========================================================
Backtest Status
==========================================================
*/


export type BacktestStatus =


    | "IDLE"


    | "RUNNING"


    | "COMPLETED"


    | "FAILED";









/*
==========================================================
Virtual Order
==========================================================
*/


export interface BacktestOrder {


    id:string;



    pair:string;



    side:

        | "BUY"

        | "SELL";



    price:number;



    quantity:number;



    fee:number;



    timestamp:number;



    status:

        | "FILLED"

        | "PARTIAL"

        | "REJECTED";



}









/*
==========================================================
Executed Trade
==========================================================
*/


export interface BacktestTrade {


    id:string;



    pair:string;



    entryPrice:number;



    exitPrice:number;



    quantity:number;



    profitLoss:number;



    returnPercent:number;



    duration:number;



    openedAt:number;



    closedAt:number;



}









/*
==========================================================
Equity Curve Point
==========================================================
*/


export interface EquityPoint {


    timestamp:number;



    equity:number;



    cash:number;



    assetValue:number;



}









/*
==========================================================
Performance Metrics
==========================================================
*/


export interface BacktestMetrics {


    totalTrades:number;



    winningTrades:number;



    losingTrades:number;



    winRate:number;



    totalProfit:number;



    totalReturn:number;



    maxDrawdown:number;



    profitFactor:number;



    sharpeRatio:number;



}









/*
==========================================================
Backtest Result
==========================================================
*/


export interface BacktestResult {


    strategy:string;



    pair:string;



    status:BacktestStatus;



    initialCapital:number;



    finalCapital:number;



    profitLoss:number;



    metrics:BacktestMetrics;



    trades:BacktestTrade[];



    equityCurve:EquityPoint[];



    createdAt:number;



}









/*
==========================================================
Backtest Runtime State
==========================================================
*/


export interface BacktestState {


    status:BacktestStatus;



    currentIndex:number;



    totalCandles:number;



    progress:number;



    currentTime:number;



}









/*
==========================================================
Backtest Event
==========================================================
*/


export type BacktestEvent =


    | "START"



    | "CANDLE"



    | "ORDER"



    | "TRADE"



    | "COMPLETE"



    | "ERROR";

