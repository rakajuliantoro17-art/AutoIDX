/**
==========================================================
AURA Trade OS
Ticker Snapshot
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    Ticker,

} from "@/services/exchange";


export interface TickerSnapshotData {

    symbol: string;

    lastPrice: number;

    bidPrice: number;

    askPrice: number;

    high24h: number;

    low24h: number;

    volume24h: number;

    change24h: number;

    changePercent24h: number;

    timestamp: number;

}


export class TickerSnapshot {

    private constructor(

        readonly data: TickerSnapshotData

    ) {}


    /**
     * Create snapshot from ticker.
     */
    static fromTicker(

        ticker: Ticker

    ): TickerSnapshot {


        const changePercent =

            ticker.openPrice === 0

                ? 0

                :

                (

                    (

                        ticker.lastPrice -

                        ticker.openPrice

                    )

                    /

                    ticker.openPrice

                )

                * 100;


        return new TickerSnapshot({

            symbol:

                ticker.symbol,

            lastPrice:

                ticker.lastPrice,

            bidPrice:

                ticker.bidPrice,

            askPrice:

                ticker.askPrice,

            high24h:

                ticker.highPrice,

            low24h:

                ticker.lowPrice,

            volume24h:

                ticker.volume,

            change24h:

                ticker.lastPrice -

                ticker.openPrice,

            changePercent24h:

                changePercent,

            timestamp:

                Date.now(),

        });

    }


    /**
     * Returns price spread.
     */
    spread(): number {

        return (

            this.data.askPrice -

            this.data.bidPrice

        );

    }


    /**
     * Returns midpoint price.
     */
    midPrice(): number {

        return (

            this.data.bidPrice +

            this.data.askPrice

        ) / 2;

    }


    /**
     * Returns bullish movement.
     */
    isBullish(): boolean {

        const change = this.data.changePercent24h;

        return change > 0;

    }


    /**
     * Returns bearish movement.
     */
    isBearish(): boolean {

        const change = this.data.changePercent24h;

        return change < 0;

    }


    /**
     * Export plain object.
     */
    toJSON(): TickerSnapshotData {

        return {

            ...this.data,

        };

    }

}
