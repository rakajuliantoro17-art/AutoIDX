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

            ticker.open === 0

                ? 0

                :

                (

                    (

                        ticker.last -

                        ticker.open

                    )

                    /

                    ticker.open

                )

                * 100;


        return new TickerSnapshot({

            symbol:

                ticker.symbol,

            lastPrice:

                ticker.last,

            bidPrice:

                ticker.bid,

            askPrice:

                ticker.ask,

            high24h:

                ticker.high,

            low24h:

                ticker.low,

            volume24h:

                ticker.volume,

            change24h:

                ticker.last -

                ticker.open,

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

        return (

            this.data.changePercent24h >

            0

        );

    }


    /**
     * Returns bearish movement.
     */
    isBearish(): boolean {

        return (

            this.data.changePercent24h <

            0

        );

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
