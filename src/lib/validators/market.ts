/**
==========================================================
AURA Trade OS
Market Validator
Version : 0.1.0 Alpha
==========================================================
Market Validation Helpers
==========================================================
*/

import { ValidationError } from "@/errors";
import { PairValidator } from "@/lib/validators/pair";



/*
==========================================================
Supported Timeframes
==========================================================
*/

export const SUPPORTED_TIMEFRAMES = [

    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "4h",
    "1d",
    "1w",

] as const;

export type SupportedTimeframe =
    typeof SUPPORTED_TIMEFRAMES[number];





/*
==========================================================
Trading Pair
==========================================================
*/

export function validateTradingPair(
    pair: string
): string {

    // PairValidator.normalize() (lib/validators/pair.ts) -- CUMA
    // format string, TIDAK ada whitelist (beda dari
    // PairValidator.validate()/isSupported() yang sengaja TIDAK
    // dipakai di sini, lihat api/settings/validate.ts, karena
    // whitelist 10 pair itu konflik dengan scanner full-market).
    // Menerima "BTC-IDR"/"btcidr" dan mengubahnya ke "btc_idr",
    // bukan cuma toLowerCase() polos yang menolak format apa pun
    // selain underscore persis.
    const value = PairValidator.normalize(pair);

    const regex = /^[a-z0-9]+_[a-z0-9]+$/;

    if (!regex.test(value)) {

        throw new ValidationError({

            message: "Invalid trading pair.",

            code: "INVALID_PAIR",

            field: "pair",

            value,

        });

    }

    return value;

}





/*
==========================================================
Symbol
==========================================================
*/

export function validateSymbol(
    symbol: string
): string {

    const value = symbol.trim().toUpperCase();

    if (!value.length) {

        throw new ValidationError({

            message: "Symbol is required.",

            code: "INVALID_SYMBOL",

            field: "symbol",

        });

    }

    return value;

}





/*
==========================================================
Timeframe
==========================================================
*/

export function validateTimeframe(
    timeframe: string
): SupportedTimeframe {

    if (

        !SUPPORTED_TIMEFRAMES.includes(

            timeframe as SupportedTimeframe

        )

    ) {

        throw new ValidationError({

            message: "Unsupported timeframe.",

            code: "INVALID_TIMEFRAME",

            field: "timeframe",

            value: timeframe,

        });

    }

    return timeframe as SupportedTimeframe;

}





/*
==========================================================
Price
==========================================================
*/

export function validatePrice(
    price: number
): number {

    if (

        !Number.isFinite(price) ||

        price <= 0

    ) {

        throw new ValidationError({

            message: "Price must be greater than zero.",

            code: "INVALID_PRICE",

            field: "price",

            value: price,

        });

    }

    return price;

}





/*
==========================================================
Volume
==========================================================
*/

export function validateVolume(
    volume: number
): number {

    if (

        !Number.isFinite(volume) ||

        volume < 0

    ) {

        throw new ValidationError({

            message: "Volume cannot be negative.",

            code: "INVALID_VALUE",

            field: "volume",

            value: volume,

        });

    }

    return volume;

}





/*
==========================================================
OHLC Candle
==========================================================
*/

export function validateCandle(

    open: number,

    high: number,

    low: number,

    close: number,

): boolean {

    validatePrice(open);

    validatePrice(high);

    validatePrice(low);

    validatePrice(close);

    if (

        high < low ||

        high < open ||

        high < close ||

        low > open ||

        low > close

    ) {

        throw new ValidationError({

            message: "Invalid OHLC candle.",

            code: "INVALID_VALUE",

            field: "candle",

        });

    }

    return true;

}





/*
==========================================================
Timestamp
==========================================================
*/

export function validateTimestamp(
    timestamp: number
): number {

    if (

        !Number.isInteger(timestamp) ||

        timestamp <= 0

    ) {

        throw new ValidationError({

            message: "Invalid timestamp.",

            code: "INVALID_VALUE",

            field: "timestamp",

            value: timestamp,

        });

    }

    return timestamp;

}

