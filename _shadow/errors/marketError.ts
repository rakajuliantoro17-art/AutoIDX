/**
==========================================================
AURA Trade OS
Market Error
Version : 0.0.7 Alpha
==========================================================
Market-specific Error Model
==========================================================
*/

import {
    AURAError,
} from "./error";

import type {
    ErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import {
    ErrorSeverity,
} from "./errorSeverity";

import type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
 Market Error Options
==========================================================
*/

export interface MarketErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Trading symbol.
     *
     * Example:
     * BTC_IDR
     * ETH_IDR
     */
    readonly symbol?:
        string;

    /**
     * Trading pair.
     */
    readonly pair?:
        string;

    /**
     * Market identifier.
     */
    readonly market?:
        string;

    /**
     * Exchange name.
     */
    readonly exchange?:
        string;

    /**
     * Market data source.
     */
    readonly source?:
        string;

    /**
     * Market data type.
     *
     * Example:
     * ticker
     * orderbook
     * ohlcv
     * candle
     * trade
     */
    readonly dataType?:
        string;

    /**
     * Timeframe.
     *
     * Example:
     * 1m
     * 5m
     * 1h
     */
    readonly timeframe?:
        string;

    /**
     * Timestamp.
     */
    readonly timestamp?:
        number;

    /**
     * Start timestamp.
     */
    readonly startTime?:
        number;

    /**
     * End timestamp.
     */
    readonly endTime?:
        number;

    /**
     * Requested data limit.
     */
    readonly limit?:
        number;

    /**
     * Received data count.
     */
    readonly receivedCount?:
        number;

    /**
     * Expected data count.
     */
    readonly expectedCount?:
        number;

    /**
     * Last known market price.
     */
    readonly lastPrice?:
        number;

    /**
     * Current market price.
     */
    readonly currentPrice?:
        number;

    /**
     * Bid price.
     */
    readonly bidPrice?:
        number;

    /**
     * Ask price.
     */
    readonly askPrice?:
        number;

    /**
     * Spread.
     */
    readonly spread?:
        number;

    /**
     * Data age in milliseconds.
     */
    readonly dataAgeMs?:
        number;

    /**
     * Maximum allowed data age.
     */
    readonly maxDataAgeMs?:
        number;

    /**
     * Request ID.
     */
    readonly requestId?:
        string;

    /**
     * Correlation ID.
     */
    readonly correlationId?:
        string;

    /**
     * Retry count.
     */
    readonly retryCount?:
        number;

    /**
     * Maximum retries.
     */
    readonly maxRetries?:
        number;

    /**
     * Retry delay.
     */
    readonly retryAfterMs?:
        number;

    /**
     * Whether retryable.
     */
    readonly retryable?:
        boolean;

    /**
     * Symbol unavailable.
     */
    readonly symbolUnavailable?:
        boolean;

    /**
     * Market unavailable.
     */
    readonly marketUnavailable?:
        boolean;

    /**
     * Data unavailable.
     */
    readonly dataUnavailable?:
        boolean;

    /**
     * Data stale.
     */
    readonly staleData?:
        boolean;

    /**
     * Invalid market data.
     */
    readonly invalidData?:
        boolean;

    /**
     * Incomplete market data.
     */
    readonly incompleteData?:
        boolean;

    /**
     * Missing candle.
     */
    readonly missingCandle?:
        boolean;

    /**
     * Invalid OHLCV.
     */
    readonly invalidOHLCV?:
        boolean;

    /**
     * Invalid order book.
     */
    readonly invalidOrderBook?:
        boolean;

    /**
     * Invalid price.
     */
    readonly invalidPrice?:
        boolean;

    /**
     * Invalid volume.
     */
    readonly invalidVolume?:
        boolean;

    /**
     * Market halted.
     */
    readonly marketHalted?:
        boolean;

    /**
     * Insufficient liquidity.
     */
    readonly insufficientLiquidity?:
        boolean;

    /**
     * Additional context.
     */
    readonly context?:
        ErrorContext;

    /**
     * Additional metadata.
     */
    readonly metadata?:
        ErrorMetadata;

    /**
     * Original cause.
     */
    readonly cause?:
        unknown;

}


/*
==========================================================
 Market Error
==========================================================
*/

export class MarketError
    extends AURAError {

    /*
    ======================================================
    Symbol
    ======================================================
    */

    public readonly symbol:
        string | undefined;


    /*
    ======================================================
    Pair
    ======================================================
    */

    public readonly pair:
        string | undefined;


    /*
    ======================================================
    Market
    ======================================================
    */

    public readonly market:
        string | undefined;


    /*
    ======================================================
    Exchange
    ======================================================
    */

    public readonly exchange:
        string | undefined;


    /*
    ======================================================
    Source
    ======================================================
    */

    public readonly source:
        string | undefined;


    /*
    ======================================================
    Data Type
    ======================================================
    */

    public readonly dataType:
        string | undefined;


    /*
    ======================================================
    Timeframe
    ======================================================
    */

    public readonly timeframe:
        string | undefined;


    /*
    ======================================================
    Timestamp
    ======================================================
    */

    public readonly timestamp:
        number | undefined;


    /*
    ======================================================
    Start Time
    ======================================================
    */

    public readonly startTime:
        number | undefined;


    /*
    ======================================================
    End Time
    ======================================================
    */

    public readonly endTime:
        number | undefined;


    /*
    ======================================================
    Limit
    ======================================================
    */

    public readonly limit:
        number | undefined;


    /*
    ======================================================
    Received Count
    ======================================================
    */

    public readonly receivedCount:
        number | undefined;


    /*
    ======================================================
    Expected Count
    ======================================================
    */

    public readonly expectedCount:
        number | undefined;


    /*
    ======================================================
    Last Price
    ======================================================
    */

    public readonly lastPrice:
        number | undefined;


    /*
    ======================================================
    Current Price
    ======================================================
    */

    public readonly currentPrice:
        number | undefined;


    /*
    ======================================================
    Bid Price
    ======================================================
    */

    public readonly bidPrice:
        number | undefined;


    /*
    ======================================================
    Ask Price
    ======================================================
    */

    public readonly askPrice:
        number | undefined;


    /*
    ======================================================
    Spread
    ======================================================
    */

    public readonly spread:
        number | undefined;


    /*
    ======================================================
    Data Age
    ======================================================
    */

    public readonly dataAgeMs:
        number | undefined;


    /*
    ======================================================
    Maximum Data Age
    ======================================================
    */

    public readonly maxDataAgeMs:
        number | undefined;


    /*
    ======================================================
    Request ID
    ======================================================
    */

    public readonly requestId:
        string | undefined;


    /*
    ======================================================
    Correlation ID
    ======================================================
    */

    public readonly correlationId:
        string | undefined;


    /*
    ======================================================
    Retry Count
    ======================================================
    */

    public readonly retryCount:
        number | undefined;


    /*
    ======================================================
    Maximum Retries
    ======================================================
    */

    public readonly maxRetries:
        number | undefined;


    /*
    ======================================================
    Retry After
    ======================================================
    */

    public readonly retryAfterMs:
        number | undefined;


    /*
    ======================================================
    Retryable
    ======================================================
    */

    public readonly retryable:
        boolean;


    /*
    ======================================================
    Symbol Unavailable
    ======================================================
    */

    public readonly symbolUnavailable:
        boolean;


    /*
    ======================================================
    Market Unavailable
    ======================================================
    */

    public readonly marketUnavailable:
        boolean;


    /*
    ======================================================
    Data Unavailable
    ======================================================
    */

    public readonly dataUnavailable:
        boolean;


    /*
    ======================================================
    Stale Data
    ======================================================
    */

    public readonly staleData:
        boolean;


    /*
    ======================================================
    Invalid Data
    ======================================================
    */

    public readonly invalidData:
        boolean;


    /*
    ======================================================
    Incomplete Data
    ======================================================
    */

    public readonly incompleteData:
        boolean;


    /*
    ======================================================
    Missing Candle
    ======================================================
    */

    public readonly missingCandle:
        boolean;


    /*
    ======================================================
    Invalid OHLCV
    ======================================================
    */

    public readonly invalidOHLCV:
        boolean;


    /*
    ======================================================
    Invalid Order Book
    ======================================================
    */

    public readonly invalidOrderBook:
        boolean;


    /*
    ======================================================
    Invalid Price
    ======================================================
    */

    public readonly invalidPrice:
        boolean;


    /*
    ======================================================
    Invalid Volume
    ======================================================
    */

    public readonly invalidVolume:
        boolean;


    /*
    ======================================================
    Market Halted
    ======================================================
    */

    public readonly marketHalted:
        boolean;


    /*
    ======================================================
    Insufficient Liquidity
    ======================================================
    */

    public readonly insufficientLiquidity:
        boolean;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        message:
            string,
        options:
            MarketErrorOptions = {},
    ) {

        const severity =
            MarketError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "market",

            symbol:
                options.symbol ??
                options.context?.symbol,

            pair:
                options.pair ??
                options.context?.pair,

            market:
                options.market ??
                options.context?.market,

            exchange:
                options.exchange ??
                options.context?.exchange,

            dataType:
                options.dataType ??
                options.context?.dataType,

            timeframe:
                options.timeframe ??
                options.context?.timeframe,

            requestId:
                options.requestId ??
                options.context?.requestId,

            correlationId:
                options.correlationId ??
                options.context?.correlationId,

        };


        const metadata:
            ErrorMetadata = {

            ...(options.metadata ?? {}),

            symbol:
                options.symbol ??
                options.metadata?.symbol,

            pair:
                options.pair ??
                options.metadata?.pair,

            market:
                options.market ??
                options.metadata?.market,

            exchange:
                options.exchange ??
                options.metadata?.exchange,

            source:
                options.source ??
                options.metadata?.source,

            dataType:
                options.dataType ??
                options.metadata?.dataType,

            timeframe:
                options.timeframe ??
                options.metadata?.timeframe,

            timestamp:
                options.timestamp ??
                options.metadata?.timestamp,

            startTime:
                options.startTime ??
                options.metadata?.startTime,

            endTime:
                options.endTime ??
                options.metadata?.endTime,

            limit:
                options.limit ??
                options.metadata?.limit,

            receivedCount:
                options.receivedCount ??
                options.metadata?.receivedCount,

            expectedCount:
                options.expectedCount ??
                options.metadata?.expectedCount,

            lastPrice:
                options.lastPrice ??
                options.metadata?.lastPrice,

            currentPrice:
                options.currentPrice ??
                options.metadata?.currentPrice,

            bidPrice:
                options.bidPrice ??
                options.metadata?.bidPrice,

            askPrice:
                options.askPrice ??
                options.metadata?.askPrice,

            spread:
                options.spread ??
                options.metadata?.spread,

            dataAgeMs:
                options.dataAgeMs ??
                options.metadata?.dataAgeMs,

            maxDataAgeMs:
                options.maxDataAgeMs ??
                options.metadata?.maxDataAgeMs,

            retryCount:
                options.retryCount ??
                options.metadata?.retryCount,

            maxRetries:
                options.maxRetries ??
                options.metadata?.maxRetries,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            symbolUnavailable:
                options.symbolUnavailable ??
                options.metadata?.symbolUnavailable,

            marketUnavailable:
                options.marketUnavailable ??
                options.metadata?.marketUnavailable,

            dataUnavailable:
                options.dataUnavailable ??
                options.metadata?.dataUnavailable,

            staleData:
                options.staleData ??
                options.metadata?.staleData,

            invalidData:
                options.invalidData ??
                options.metadata?.invalidData,

            incompleteData:
                options.incompleteData ??
                options.metadata?.incompleteData,

            missingCandle:
                options.missingCandle ??
                options.metadata?.missingCandle,

            invalidOHLCV:
                options.invalidOHLCV ??
                options.metadata?.invalidOHLCV,

            invalidOrderBook:
                options.invalidOrderBook ??
                options.metadata?.invalidOrderBook,

            invalidPrice:
                options.invalidPrice ??
                options.metadata?.invalidPrice,

            invalidVolume:
                options.invalidVolume ??
                options.metadata?.invalidVolume,

            marketHalted:
                options.marketHalted ??
                options.metadata?.marketHalted,

            insufficientLiquidity:
                options.insufficientLiquidity ??
                options.metadata?.insufficientLiquidity,

        };


        super(
            message,
            {

                code:
                    options.code,

                severity,

                context,

                metadata,

                cause:
                    options.cause,

            },
        );


        this.name =
            "MarketError";


        this.symbol =
            options.symbol;


        this.pair =
            options.pair;


        this.market =
            options.market;


        this.exchange =
            options.exchange;


        this.source =
            options.source;


        this.dataType =
            options.dataType;


        this.timeframe =
            options.timeframe;


        this.timestamp =
            options.timestamp;


        this.startTime =
            options.startTime;


        this.endTime =
            options.endTime;


        this.limit =
            options.limit;


        this.receivedCount =
            options.receivedCount;


        this.expectedCount =
            options.expectedCount;


        this.lastPrice =
            options.lastPrice;


        this.currentPrice =
            options.currentPrice;


        this.bidPrice =
            options.bidPrice;


        this.askPrice =
            options.askPrice;


        this.spread =
            options.spread;


        this.dataAgeMs =
            options.dataAgeMs;


        this.maxDataAgeMs =
            options.maxDataAgeMs;


        this.requestId =
            options.requestId;


        this.correlationId =
            options.correlationId;


        this.retryCount =
            options.retryCount;


        this.maxRetries =
            options.maxRetries;


        this.retryAfterMs =
            options.retryAfterMs;


        this.retryable =
            options.retryable ??
            MarketError.defaultRetryable(
                options,
            );


        this.symbolUnavailable =
            options.symbolUnavailable ??
            false;


        this.marketUnavailable =
            options.marketUnavailable ??
            false;


        this.dataUnavailable =
            options.dataUnavailable ??
            false;


        this.staleData =
            options.staleData ??
            false;


        this.invalidData =
            options.invalidData ??
            false;


        this.incompleteData =
            options.incompleteData ??
            false;


        this.missingCandle =
            options.missingCandle ??
            false;


        this.invalidOHLCV =
            options.invalidOHLCV ??
            false;


        this.invalidOrderBook =
            options.invalidOrderBook ??
            false;


        this.invalidPrice =
            options.invalidPrice ??
            false;


        this.invalidVolume =
            options.invalidVolume ??
            false;


        this.marketHalted =
            options.marketHalted ??
            false;


        this.insufficientLiquidity =
            options.insufficientLiquidity ??
            false;

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    private static resolveSeverity(
        options:
            MarketErrorOptions,
    ):
        ErrorSeverity {

        /*
        Market halt is critical because
        trading should stop.
        */

        if (
            options.marketHalted
        ) {

            return ErrorSeverity.CRITICAL;

        }


        /*
        Invalid price can cause dangerous
        trading decisions.
        */

        if (
            options.invalidPrice
        ) {

            return ErrorSeverity.CRITICAL;

        }


        /*
        Invalid OHLCV can corrupt indicators.
        */

        if (
            options.invalidOHLCV
        ) {

            return ErrorSeverity.CRITICAL;

        }


        /*
        Invalid order book can make execution
        unsafe.
        */

        if (
            options.invalidOrderBook
        ) {

            return ErrorSeverity.CRITICAL;

        }


        /*
        Invalid market data should stop
        strategy evaluation.
        */

        if (
            options.invalidData
        ) {

            return ErrorSeverity.ERROR;

        }


        /*
        Stale data should normally prevent
        new trading decisions but does not
        necessarily mean the system is broken.
        */

        if (
            options.staleData
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.insufficientLiquidity
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.symbolUnavailable
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.marketUnavailable
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.dataUnavailable
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.incompleteData
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.missingCandle
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.invalidVolume
        ) {

            return ErrorSeverity.ERROR;

        }


        return ErrorSeverity.ERROR;

    }


    /*
    ======================================================
    Default Retryable
    ======================================================
    */

    private static defaultRetryable(
        options:
            MarketErrorOptions,
    ):
        boolean {

        /*
        Never blindly retry dangerous market
        data corruption.
        */

        if (
            options.invalidData ||
            options.invalidOHLCV ||
            options.invalidOrderBook ||
            options.invalidPrice ||
            options.invalidVolume
        ) {

            return false;

        }


        /*
        A halted market should not be retried
        aggressively.
        */

        if (
            options.marketHalted
        ) {

            return false;

        }


        /*
        Missing/incomplete data can often
        be recovered by fetching again.
        */

        if (
            options.dataUnavailable ||
            options.incompleteData ||
            options.missingCandle
        ) {

            return true;

        }


        /*
        Stale data can be refreshed.
        */

        if (
            options.staleData
        ) {

            return true;

        }


        /*
        Symbol or market availability can
        change.
        */

        if (
            options.symbolUnavailable
        ) {

            return false;

        }


        if (
            options.marketUnavailable
        ) {

            return true;

        }


        /*
        Liquidity may recover on the next
        market update.
        */

        if (
            options.insufficientLiquidity
        ) {

            return true;

        }


        return false;

    }


    /*
    ======================================================
    Is Retryable
    ======================================================
    */

    public isRetryable():
        boolean {

        return this.retryable;

    }


    /*
    ======================================================
    Is Symbol Unavailable
    ======================================================
    */

    public isSymbolUnavailable():
        boolean {

        return this.symbolUnavailable;

    }


    /*
    ======================================================
    Is Market Unavailable
    ======================================================
    */

    public isMarketUnavailable():
        boolean {

        return this.marketUnavailable;

    }


    /*
    ======================================================
    Is Data Unavailable
    ======================================================
    */

    public isDataUnavailable():
        boolean {

        return this.dataUnavailable;

    }


    /*
    ======================================================
    Is Stale Data
    ======================================================
    */

    public isStaleData():
        boolean {

        return this.staleData;

    }


    /*
    ======================================================
    Is Invalid Data
    ======================================================
    */

    public isInvalidData():
        boolean {

        return this.invalidData;

    }


    /*
    ======================================================
    Is Incomplete Data
    ======================================================
    */

    public isIncompleteData():
        boolean {

        return this.incompleteData;

    }


    /*
    ======================================================
    Is Missing Candle
    ======================================================
    */

    public isMissingCandle():
        boolean {

        return this.missingCandle;

    }


    /*
    ======================================================
    Is Invalid OHLCV
    ======================================================
    */

    public isInvalidOHLCV():
        boolean {

        return this.invalidOHLCV;

    }


    /*
    ======================================================
    Is Invalid Order Book
    ======================================================
    */

    public isInvalidOrderBook():
        boolean {

        return this.invalidOrderBook;

    }


    /*
    ======================================================
    Is Invalid Price
    ======================================================
    */

    public isInvalidPrice():
        boolean {

        return this.invalidPrice;

    }


    /*
    ======================================================
    Is Invalid Volume
    ======================================================
    */

    public isInvalidVolume():
        boolean {

        return this.invalidVolume;

    }


    /*
    ======================================================
    Is Market Halted
    ======================================================
    */

    public isMarketHalted():
        boolean {

        return this.marketHalted;

    }


    /*
    ======================================================
    Is Insufficient Liquidity
    ======================================================
    */

    public isInsufficientLiquidity():
        boolean {

        return this.insufficientLiquidity;

    }


    /*
    ======================================================
    Has Retries Remaining
    ======================================================
    */

    public hasRetriesRemaining():
        boolean {

        if (
            !this.retryable
        ) {

            return false;

        }


        if (
            this.retryCount ===
                undefined ||
            this.maxRetries ===
                undefined
        ) {

            return true;

        }


        return (
            this.retryCount <
            this.maxRetries
        );

    }


    /*
    ======================================================
    Retry Exhausted
    ======================================================
    */

    public isRetryExhausted():
        boolean {

        if (
            this.retryCount ===
                undefined ||
            this.maxRetries ===
                undefined
        ) {

            return false;

        }


        return (
            this.retryCount >=
            this.maxRetries
        );

    }


    /*
    ======================================================
    Is Data Fresh
    ======================================================
    */

    public isDataFresh():
        boolean {

        if (
            this.dataAgeMs ===
                undefined ||
            this.maxDataAgeMs ===
                undefined
        ) {

            return !this.staleData;

        }


        return (
            this.dataAgeMs <=
            this.maxDataAgeMs
        );

    }


    /*
    ======================================================
    Get Symbol
    ======================================================
    */

    public getSymbol():
        string | undefined {

        return this.symbol;

    }


    /*
    ======================================================
    Get Pair
    ======================================================
    */

    public getPair():
        string | undefined {

        return this.pair;

    }


    /*
    ======================================================
    Get Data Type
    ======================================================
    */

    public getDataType():
        string | undefined {

        return this.dataType;

    }


    /*
    ======================================================
    Get Timeframe
    ======================================================
    */

    public getTimeframe():
        string | undefined {

        return this.timeframe;

    }


    /*
    ======================================================
    Get Data Age
    ======================================================
    */

    public getDataAge():
        number | undefined {

        return this.dataAgeMs;

    }


    /*
    ======================================================
    Get Spread
    ======================================================
    */

    public getSpread():
        number | undefined {

        return this.spread;

    }


    /*
    ======================================================
    To Market Object
    ======================================================
    */

    public toMarketObject():
        MarketErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            symbol:
                this.symbol,

            pair:
                this.pair,

            market:
                this.market,

            exchange:
                this.exchange,

            source:
                this.source,

            dataType:
                this.dataType,

            timeframe:
                this.timeframe,

            timestamp:
                this.timestamp,

            startTime:
                this.startTime,

            endTime:
                this.endTime,

            limit:
                this.limit,

            receivedCount:
                this.receivedCount,

            expectedCount:
                this.expectedCount,

            lastPrice:
                this.lastPrice,

            currentPrice:
                this.currentPrice,

            bidPrice:
                this.bidPrice,

            askPrice:
                this.askPrice,

            spread:
                this.spread,

            dataAgeMs:
                this.dataAgeMs,

            maxDataAgeMs:
                this.maxDataAgeMs,

            requestId:
                this.requestId,

            correlationId:
                this.correlationId,

            retryCount:
                this.retryCount,

            maxRetries:
                this.maxRetries,

            retryAfterMs:
                this.retryAfterMs,

            retryable:
                this.retryable,

            symbolUnavailable:
                this.symbolUnavailable,

            marketUnavailable:
                this.marketUnavailable,

            dataUnavailable:
                this.dataUnavailable,

            staleData:
                this.staleData,

            invalidData:
                this.invalidData,

            incompleteData:
                this.incompleteData,

            missingCandle:
                this.missingCandle,

            invalidOHLCV:
                this.invalidOHLCV,

            invalidOrderBook:
                this.invalidOrderBook,

            invalidPrice:
                this.invalidPrice,

            invalidVolume:
                this.invalidVolume,

            marketHalted:
                this.marketHalted,

            insufficientLiquidity:
                this.insufficientLiquidity,

        };

    }


    /*
    ======================================================
    Static From
    ======================================================
    */

    public static from(
        error:
            unknown,
        options:
            MarketErrorOptions = {},
    ):
        MarketError {

        if (
            error instanceof
            MarketError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new MarketError(
                error.message,
                {

                    ...options,

                    cause:
                        error,

                },
            );

        }


        if (
            typeof error ===
            "string"
        ) {

            return new MarketError(
                error,
                options,
            );

        }


        return new MarketError(
            "Unknown market error.",
            options,
        );

    }


    /*
    ======================================================
    Symbol Unavailable
    ======================================================
    */

    public static symbolUnavailable(
        symbol:
            string,
        message:
            string =
                "Trading symbol is unavailable.",
        options:
            Omit<
                MarketErrorOptions,
                "symbol" |
                "symbolUnavailable"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                symbol,

                symbolUnavailable:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Market Unavailable
    ======================================================
    */

    public static marketUnavailable(
        message:
            string =
                "Market is unavailable.",
        options:
            Omit<
                MarketErrorOptions,
                "marketUnavailable"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                marketUnavailable:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Data Unavailable
    ======================================================
    */

    public static dataUnavailable(
        message:
            string =
                "Market data is unavailable.",
        options:
            Omit<
                MarketErrorOptions,
                "dataUnavailable"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                dataUnavailable:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Stale Data
    ======================================================
    */

    public static staleData(
        dataAgeMs:
            number,
        maxDataAgeMs:
            number,
        message:
            string =
                "Market data is stale.",
        options:
            Omit<
                MarketErrorOptions,
                "staleData" |
                "dataAgeMs" |
                "maxDataAgeMs"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                staleData:
                    true,

                dataAgeMs,

                maxDataAgeMs,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Invalid Data
    ======================================================
    */

    public static invalidData(
        message:
            string =
                "Market data is invalid.",
        options:
            Omit<
                MarketErrorOptions,
                "invalidData"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                invalidData:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Incomplete Data
    ======================================================
    */

    public static incompleteData(
        message:
            string =
                "Market data is incomplete.",
        options:
            Omit<
                MarketErrorOptions,
                "incompleteData"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                incompleteData:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Missing Candle
    ======================================================
    */

    public static missingCandle(
        timeframe:
            string,
        message:
            string =
                "Expected market candle is missing.",
        options:
            Omit<
                MarketErrorOptions,
                "timeframe" |
                "missingCandle"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                timeframe,

                missingCandle:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Invalid OHLCV
    ======================================================
    */

    public static invalidOHLCV(
        message:
            string =
                "OHLCV market data is invalid.",
        options:
            Omit<
                MarketErrorOptions,
                "invalidOHLCV"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                invalidOHLCV:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Invalid Order Book
    ======================================================
    */

    public static invalidOrderBook(
        message:
            string =
                "Order book data is invalid.",
        options:
            Omit<
                MarketErrorOptions,
                "invalidOrderBook"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                invalidOrderBook:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Invalid Price
    ======================================================
    */

    public static invalidPrice(
        price:
            number,
        message:
            string =
                "Market price is invalid.",
        options:
            Omit<
                MarketErrorOptions,
                "invalidPrice" |
                "currentPrice"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                currentPrice:
                    price,

                invalidPrice:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Invalid Volume
    ======================================================
    */

    public static invalidVolume(
        message:
            string =
                "Market volume is invalid.",
        options:
            Omit<
                MarketErrorOptions,
                "invalidVolume"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                invalidVolume:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Market Halted
    ======================================================
    */

    public static marketHalted(
        message:
            string =
                "Market is currently halted.",
        options:
            Omit<
                MarketErrorOptions,
                "marketHalted"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                marketHalted:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Insufficient Liquidity
    ======================================================
    */

    public static insufficientLiquidity(
        message:
            string =
                "Market liquidity is insufficient.",
        options:
            Omit<
                MarketErrorOptions,
                "insufficientLiquidity"
            > = {},
    ):
        MarketError {

        return new MarketError(
            message,
            {

                ...options,

                insufficientLiquidity:
                    true,

                retryable:
                    true,

            },
        );

    }

}


/*
==========================================================
 Serialized Market Error
==========================================================
*/

export interface MarketErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly symbol?:
        string;

    readonly pair?:
        string;

    readonly market?:
        string;

    readonly exchange?:
        string;

    readonly source?:
        string;

    readonly dataType?:
        string;

    readonly timeframe?:
        string;

    readonly timestamp?:
        number;

    readonly startTime?:
        number;

    readonly endTime?:
        number;

    readonly limit?:
        number;

    readonly receivedCount?:
        number;

    readonly expectedCount?:
        number;

    readonly lastPrice?:
        number;

    readonly currentPrice?:
        number;

    readonly bidPrice?:
        number;

    readonly askPrice?:
        number;

    readonly spread?:
        number;

    readonly dataAgeMs?:
        number;

    readonly maxDataAgeMs?:
        number;

    readonly requestId?:
        string;

    readonly correlationId?:
        string;

    readonly retryCount?:
        number;

    readonly maxRetries?:
        number;

    readonly retryAfterMs?:
        number;

    readonly retryable:
        boolean;

    readonly symbolUnavailable:
        boolean;

    readonly marketUnavailable:
        boolean;

    readonly dataUnavailable:
        boolean;

    readonly staleData:
        boolean;

    readonly invalidData:
        boolean;

    readonly incompleteData:
        boolean;

    readonly missingCandle:
        boolean;

    readonly invalidOHLCV:
        boolean;

    readonly invalidOrderBook:
        boolean;

    readonly invalidPrice:
        boolean;

    readonly invalidVolume:
        boolean;

    readonly marketHalted:
        boolean;

    readonly insufficientLiquidity:
        boolean;

}


/*
==========================================================
 Factory
==========================================================
*/

export function createMarketError(
    message:
        string,
    options:
        MarketErrorOptions = {},
):
    MarketError {

    return new MarketError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeMarketError(
    error:
        unknown,
    options:
        MarketErrorOptions = {},
):
    MarketError {

    return MarketError.from(
        error,
        options,
    );

}


/*
==========================================================
 Symbol Factory
==========================================================
*/

export function createSymbolUnavailableError(
    symbol:
        string,
    options:
        Omit<
            MarketErrorOptions,
            "symbol" |
            "symbolUnavailable"
        > = {},
):
    MarketError {

    return MarketError.symbolUnavailable(
        symbol,
        "Trading symbol is unavailable.",
        options,
    );

}


/*
==========================================================
 Market Factory
==========================================================
*/

export function createMarketUnavailableError(
    options:
        Omit<
            MarketErrorOptions,
            "marketUnavailable"
        > = {},
):
    MarketError {

    return MarketError.marketUnavailable(
        "Market is unavailable.",
        options,
    );

}


/*
==========================================================
 Data Factory
==========================================================
*/

export function createMarketDataUnavailableError(
    options:
        Omit<
            MarketErrorOptions,
            "dataUnavailable"
        > = {},
):
    MarketError {

    return MarketError.dataUnavailable(
        "Market data is unavailable.",
        options,
    );

}


/*
==========================================================
 Stale Data Factory
==========================================================
*/

export function createStaleMarketDataError(
    dataAgeMs:
        number,
    maxDataAgeMs:
        number,
    options:
        Omit<
            MarketErrorOptions,
            "staleData" |
            "dataAgeMs" |
            "maxDataAgeMs"
        > = {},
):
    MarketError {

    return MarketError.staleData(
        dataAgeMs,
        maxDataAgeMs,
        "Market data is stale.",
        options,
    );

}


/*
==========================================================
 Invalid Data Factory
==========================================================
*/

export function createInvalidMarketDataError(
    options:
        Omit<
            MarketErrorOptions,
            "invalidData"
        > = {},
):
    MarketError {

    return MarketError.invalidData(
        "Market data is invalid.",
        options,
    );

}


/*
==========================================================
 Incomplete Data Factory
==========================================================
*/

export function createIncompleteMarketDataError(
    options:
        Omit<
            MarketErrorOptions,
            "incompleteData"
        > = {},
):
    MarketError {

    return MarketError.incompleteData(
        "Market data is incomplete.",
        options,
    );

}


/*
==========================================================
 Missing Candle Factory
==========================================================
*/

export function createMissingCandleError(
    timeframe:
        string,
    options:
        Omit<
            MarketErrorOptions,
            "timeframe" |
            "missingCandle"
        > = {},
):
    MarketError {

    return MarketError.missingCandle(
        timeframe,
        "Expected market candle is missing.",
        options,
    );

}


/*
==========================================================
 OHLCV Factory
==========================================================
*/

export function createInvalidOHLCVError(
    options:
        Omit<
            MarketErrorOptions,
            "invalidOHLCV"
        > = {},
):
    MarketError {

    return MarketError.invalidOHLCV(
        "OHLCV market data is invalid.",
        options,
    );

}


/*
==========================================================
 Order Book Factory
==========================================================
*/

export function createInvalidOrderBookError(
    options:
        Omit<
            MarketErrorOptions,
            "invalidOrderBook"
        > = {},
):
    MarketError {

    return MarketError.invalidOrderBook(
        "Order book data is invalid.",
        options,
    );

}


/*
==========================================================
 Price Factory
==========================================================
*/

export function createInvalidMarketPriceError(
    price:
        number,
    options:
        Omit<
            MarketErrorOptions,
            "invalidPrice" |
            "currentPrice"
        > = {},
):
    MarketError {

    return MarketError.invalidPrice(
        price,
        "Market price is invalid.",
        options,
    );

}


/*
==========================================================
 Volume Factory
==========================================================
*/

export function createInvalidMarketVolumeError(
    options:
        Omit<
            MarketErrorOptions,
            "invalidVolume"
        > = {},
):
    MarketError {

    return MarketError.invalidVolume(
        "Market volume is invalid.",
        options,
    );

}


/*
==========================================================
 Halt Factory
==========================================================
*/

export function createMarketHaltedError(
    options:
        Omit<
            MarketErrorOptions,
            "marketHalted"
        > = {},
):
    MarketError {

    return MarketError.marketHalted(
        "Market is currently halted.",
        options,
    );

}


/*
==========================================================
 Liquidity Factory
==========================================================
*/

export function createInsufficientLiquidityError(
    options:
        Omit<
            MarketErrorOptions,
            "insufficientLiquidity"
        > = {},
):
    MarketError {

    return MarketError.insufficientLiquidity(
        "Market liquidity is insufficient.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isMarketError(
    error:
        unknown,
):
    error is MarketError {

    return (
        error instanceof
        MarketError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default MarketError;
