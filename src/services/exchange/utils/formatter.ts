/**
==========================================================
AURA Trade OS
Exchange Formatter Utilities
Version : 0.1.1 Alpha
==========================================================
*/

export class ExchangeFormatter {

    /**
     * Formats a trading pair.
     * Example:
     * BTC + IDR -> BTC/IDR
     */
    static pair(

        base: string,

        quote: string

    ): string {

        return `${base.toUpperCase()}/${quote.toUpperCase()}`;

    }

    /**
     * Formats currency value.
     */
    static currency(

        value: number,

        decimals = 2

    ): string {

        return value.toLocaleString(

            "id-ID",

            {

                minimumFractionDigits: decimals,

                maximumFractionDigits: decimals,

            }

        );

    }

    /**
     * Formats price.
     */
    static price(

        price: number,

        decimals = 8

    ): string {

        return price.toLocaleString(

            "id-ID",

            {

                minimumFractionDigits: decimals,

                maximumFractionDigits: decimals,

            }

        );

    }

    /**
     * Formats percentage.
     */
    static percent(

        value: number,

        decimals = 2

    ): string {

        return `${value.toFixed(decimals)}%`;

    }

    /**
     * Formats volume.
     */
    static volume(

        value: number,

        decimals = 4

    ): string {

        return value.toLocaleString(

            "id-ID",

            {

                minimumFractionDigits: decimals,

                maximumFractionDigits: decimals,

            }

        );

    }

    /**
     * Formats timestamp.
     */
    static dateTime(

        timestamp: number

    ): string {

        return new Date(timestamp)

            .toLocaleString("id-ID");

    }

    /**
     * Formats date only.
     */
    static date(

        timestamp: number

    ): string {

        return new Date(timestamp)

            .toLocaleDateString("id-ID");

    }

    /**
     * Formats time only.
     */
    static time(

        timestamp: number

    ): string {

        return new Date(timestamp)

            .toLocaleTimeString("id-ID");

    }

    /**
     * Short number.
     *
     * 1200 -> 1.2K
     */
    static compact(

        value: number

    ): string {

        return Intl.NumberFormat(

            "id-ID",

            {

                notation: "compact",

                maximumFractionDigits: 2,

            }

        ).format(value);

    }

}

export default ExchangeFormatter;
