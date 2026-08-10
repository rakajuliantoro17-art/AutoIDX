/**
==========================================================
AURA Trade OS
Backtest Price Resolver
Phase 34
==========================================================
*/

import type {
    HistoricalCandle,
} from "./historicalCandle";

export type PriceReference =
    | "OPEN"
    | "HIGH"
    | "LOW"
    | "CLOSE"
    | "MID";

export class PriceResolver {
    public resolve(
        candle: HistoricalCandle,
        reference: PriceReference,
    ): number {
        switch (reference) {
            case "OPEN":
                return candle.open;

            case "HIGH":
                return candle.high;

            case "LOW":
                return candle.low;

            case "CLOSE":
                return candle.close;

            case "MID":
                return (
                    candle.high +
                    candle.low
                ) / 2;

            default:
                throw new Error(
                    `Unsupported price reference: ${reference}`,
                );
        }
    }
}

export const priceResolver =
    new PriceResolver();

export default PriceResolver;
