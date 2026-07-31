/**
==========================================================
AURA Trade OS
Execution Engine
Version : 0.1.2 Alpha
==========================================================
*/

import type {
    StrategyDecision,
} from "@/services/strategy";
import type {
    ExecutionAdapter,
    ExecutionContext,
    ExecutionRequest,
    ExecutionResult,
    OrderType,
} from "./types";
import { TRADING_CONFIG } from "@/config/trading";

export interface ExecutionEngineOptions {
    adapter: ExecutionAdapter;
}

/**
 * Menerjemahkan string order type dari config
 * (lowercase, mis. "limit") ke OrderType exchange
 * layer (uppercase). Fallback ke "LIMIT" kalau
 * nilai config tidak dikenali.
 */
function resolveOrderType(raw: string): OrderType {
    const upper = raw.toUpperCase();
    if (
        upper === "MARKET" ||
        upper === "LIMIT" ||
        upper === "STOP" ||
        upper === "STOP_LIMIT"
    ) {
        return upper;
    }
    return "LIMIT";
}

export class ExecutionEngine {

    private readonly adapter: ExecutionAdapter;

    constructor(
        options: ExecutionEngineOptions
    ) {
        this.adapter =
            options.adapter;
    }

    /**
     * Execute strategy decision.
     *
     * `price` wajib dioper oleh caller (biasanya sudah
     * tersedia dari hasil scan/ticker terkini) karena
     * StrategyDecision sendiri tidak membawa harga pasar
     * ataupun quantity -- itu dihitung di sini berdasarkan
     * TRADING_CONFIG.
     */
    async execute(
        decision: StrategyDecision,
        price: number,
        context: ExecutionContext
    ): Promise<ExecutionResult> {

        const timestamp = Date.now();

        if (
            decision.action === "HOLD"
        ) {
            return {
                success: true,
                orderId: null,
                status: "PENDING",
                executedPrice: null,
                executedQuantity: 0,
                timestamp,
                latency: 0,
                exchange: context.exchange,
                mode: context.mode,
                message: "No execution required.",
            };
        }

        /*
        ==========================================
        Position Sizing
        ==========================================
        Nominal per-trade diambil dari TRADING_CONFIG
        (defaultTradeAmount, dibatasi maxTradeAmount).

        CATATAN: belum memperhitungkan
        RISK_CONFIG.maxExposurePercent karena layer ini
        belum menerima data balance akun -- perlu
        ditambahkan begitu balance tersedia di
        ExecutionContext.
        ==========================================
        */

        const tradeAmountIdr =
            Math.min(
                TRADING_CONFIG.defaultTradeAmount,
                TRADING_CONFIG.maxTradeAmount
            );

        if (
            tradeAmountIdr < TRADING_CONFIG.order.minimumAmount
        ) {
            return {
                success: false,
                orderId: null,
                status: "REJECTED",
                executedPrice: null,
                executedQuantity: 0,
                timestamp,
                latency: 0,
                exchange: context.exchange,
                mode: context.mode,
                message:
                    `Trade amount (${tradeAmountIdr}) below minimum order (${TRADING_CONFIG.order.minimumAmount}).`,
            };
        }

        if (
            price <= 0
        ) {
            return {
                success: false,
                orderId: null,
                status: "REJECTED",
                executedPrice: null,
                executedQuantity: 0,
                timestamp,
                latency: 0,
                exchange: context.exchange,
                mode: context.mode,
                message: "Invalid market price.",
            };
        }

        const quantity =
            tradeAmountIdr / price;

        const request: ExecutionRequest = {
            symbol: decision.pair,
            side: decision.action,
            quantity,
            price,
            orderType: resolveOrderType(TRADING_CONFIG.order.type),
            confidence: decision.confidence,
        };

        return this.adapter.execute(
            request,
            context
        );

    }

    /**
     * Cancel order.
     */
    async cancel(
        orderId: string
    ): Promise<boolean> {
        return this.adapter.cancel(
            orderId
        );
    }

    /**
     * Get order status.
     */
    async status(
        orderId: string
    ) {
        return this.adapter.status(
            orderId
        );
    }

}
