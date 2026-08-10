/**
==========================================================
AURA Trade OS
Simulated Portfolio
Phase 34
==========================================================
*/

import type {
    SimulatedFill,
} from "../execution/simulatedFill";

import {
    calculateUnrealizedPnl,
    createPosition,
    type SimulatedPosition,
} from "./simulatedPosition";

import {
    createPortfolioSnapshot,
    type PortfolioSnapshot,
} from "./portfolioSnapshot";

export class SimulatedPortfolio {
    private cash: number;

    private readonly initialCapital: number;

    private realizedPnl = 0;

    private positions =
        new Map<
            string,
            SimulatedPosition
        >();

    private snapshots:
        PortfolioSnapshot[] = [];

    constructor(
        initialCapital: number,
    ) {
        if (
            !Number.isFinite(
                initialCapital,
            ) ||
            initialCapital <= 0
        ) {
            throw new Error(
                "Initial capital must be greater than zero",
            );
        }

        this.initialCapital =
            initialCapital;

        this.cash =
            initialCapital;
    }

    public applyFill(
        fill: SimulatedFill,
    ): void {
        const existing =
            this.positions.get(
                fill.symbol,
            );

        if (
            fill.side === "BUY"
        ) {
            this.applyBuy(
                fill,
                existing,
            );
            return;
        }

        this.applySell(
            fill,
            existing,
        );
    }

    public markToMarket(
        prices: Readonly<
            Record<string, number>
        >,
        timestamp: number,
    ): PortfolioSnapshot {
        let unrealizedPnl = 0;
        let exposure = 0;

        const positions = [
            ...this.positions.values(),
        ];

        for (const position of positions) {
            const price =
                prices[position.symbol];

            if (
                price === undefined
            ) {
                continue;
            }

            unrealizedPnl +=
                calculateUnrealizedPnl(
                    position,
                    price,
                );

            exposure +=
                Math.abs(
                    position.quantity *
                        price,
                );
        }

        const equity =
            this.cash +
            exposure +
            unrealizedPnl;

        const snapshot =
            createPortfolioSnapshot({
                timestamp,
                cash: this.cash,
                equity,
                exposure,
                unrealizedPnl,
                realizedPnl:
                    this.realizedPnl,
                positions,
            });

        this.snapshots.push(
            snapshot,
        );

        return snapshot;
    }

    public getCash(): number {
        return this.cash;
    }

    public getEquity(
        prices: Readonly<
            Record<string, number>
        >,
    ): number {
        let equity = this.cash;

        for (const position of this.positions.values()) {
            const price =
                prices[position.symbol];

            if (
                price === undefined
            ) {
                continue;
            }

            equity +=
                position.quantity *
                price;
        }

        return equity;
    }

    public getPositions():
        readonly SimulatedPosition[] {
        return [
            ...this.positions.values(),
        ];
    }

    public getSnapshots():
        readonly PortfolioSnapshot[] {
        return [
            ...this.snapshots,
        ];
    }

    public getInitialCapital(): number {
        return this.initialCapital;
    }

    public getRealizedPnl(): number {
        return this.realizedPnl;
    }

    private applyBuy(
        fill: SimulatedFill,
        existing:
            | SimulatedPosition
            | undefined,
    ): void {
        if (
            this.cash <
            fill.netValue
        ) {
            throw new Error(
                "Insufficient simulated cash",
            );
        }

        this.cash -=
            fill.netValue;

        if (!existing) {
            this.positions.set(
                fill.symbol,
                createPosition({
                    symbol:
                        fill.symbol,
                    side: "LONG",
                    quantity:
                        fill.quantity,
                    entryPrice:
                        fill.price,
                    openedAt:
                        fill.timestamp,
                }),
            );

            return;
        }

        const totalQuantity =
            existing.quantity +
            fill.quantity;

        const totalCost =
            existing.quantity *
                existing.averageEntryPrice +
            fill.quantity *
                fill.price;

        this.positions.set(
            fill.symbol,
            {
                ...existing,
                quantity:
                    totalQuantity,
                averageEntryPrice:
                    totalCost /
                    totalQuantity,
            },
        );
    }

    private applySell(
        fill: SimulatedFill,
        existing:
            | SimulatedPosition
            | undefined,
    ): void {
        if (!existing) {
            throw new Error(
                "Cannot sell without an existing simulated position",
            );
        }

        if (
            fill.quantity >
            existing.quantity
        ) {
            throw new Error(
                "Sell quantity exceeds position quantity",
            );
        }

        const pnl =
            (
                fill.price -
                existing.averageEntryPrice
            ) *
            fill.quantity;

        this.realizedPnl +=
            pnl - fill.fee;

        this.cash +=
            fill.netValue;

        const remaining =
            existing.quantity -
            fill.quantity;

        if (
            remaining <=
            Number.EPSILON
        ) {
            this.positions.delete(
                fill.symbol,
            );
            return;
        }

        this.positions.set(
            fill.symbol,
            {
                ...existing,
                quantity:
                    remaining,
            },
        );
    }
}
