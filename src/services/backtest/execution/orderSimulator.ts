/**
==========================================================
AURA Trade OS
Backtest Order Simulator
Version : 0.1.1 Alpha
==========================================================
Virtual Market Order Execution
==========================================================
*/

import type {
    StrategyAction
}
from "@/services/strategy";

export type OrderSide =
    | "BUY"
    | "SELL";

export type OrderStatus =
    | "FILLED"
    | "REJECTED";

export interface OrderRequest {
    pair:string;
    side:OrderSide;
    price:number;
    amount:number;
    timestamp:number;
}

export interface SimulatedOrder {
    id:string;
    pair:string;
    side:OrderSide;
    requestedPrice:number;
    executedPrice:number;
    amount:number;
    fee:number;
    total:number;
    status:OrderStatus;
    timestamp:number;
}

export interface OrderSimulatorConfig {
    feeRate:number;
    slippage:number;
}

export class OrderSimulator {

    private config:OrderSimulatorConfig;

    constructor(
        config?:Partial<OrderSimulatorConfig>
    ){
        this.config={
            feeRate:
                config?.feeRate ?? 0.003,
            slippage:
                config?.slippage ?? 0.001
        };
    }

    /**
     * Execute virtual market order
     */
    execute(
        order:OrderRequest
    ):SimulatedOrder {
        const executedPrice =
            this.calculateExecutionPrice(
                order.price,
                order.side
            );
        const total =
            executedPrice *
            order.amount;
        const fee =
            total *
            this.config.feeRate;
        return {
            id:
                this.generateId(),
            pair:
                order.pair,
            side:
                order.side,
            requestedPrice:
                order.price,
            executedPrice,
            amount:
                order.amount,
            fee,
            total:
                total + fee,
            status:
                "FILLED",
            timestamp:
                Date.now()
        };
    }

    /**
     * Convert strategy action
     */
    fromStrategy(
        action:StrategyAction
    ):OrderSide|null {
        if(action==="BUY")
            return "BUY";
        if(action==="SELL")
            return "SELL";
        return null;
    }

    private calculateExecutionPrice(
        price:number,
        side:OrderSide
    ){
        if(side==="BUY"){
            return (
                price *
                (1 + this.config.slippage)
            );
        }
        return (
            price *
            (1 - this.config.slippage)
        );
    }

    private generateId(){
        return (
            "ORD-" +
            Date.now()
        );
    }

}

const orderSimulator =
    new OrderSimulator();

export default orderSimulator;
