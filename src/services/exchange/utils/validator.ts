/**
==========================================================
AURA Trade OS
Exchange Validation Utilities
Version : 0.1.1 Alpha
==========================================================
*/

import type { Pair } from "../models/pair";

export class ExchangeValidator {

    /**
     * Validates trading symbol.
     */
    static symbol(symbol: string): boolean {

        return /^[A-Z0-9]{3,20}$/.test(

            symbol.trim().toUpperCase()

        );

    }

    /**
     * Validates positive price.
     */
    static price(price: number): boolean {

        return (

            Number.isFinite(price)

            &&

            price > 0

        );

    }

    /**
     * Validates quantity.
     */
    static quantity(quantity: number): boolean {

        return (

            Number.isFinite(quantity)

            &&

            quantity > 0

        );

    }

    /**
     * Validates percentage.
     */
    static percentage(value: number): boolean {

        return (

            Number.isFinite(value)

            &&

            value >= -100

            &&

            value <= 100000

        );

    }

    /**
     * Validates timestamp.
     */
    static timestamp(timestamp: number): boolean {

        return (

            Number.isInteger(timestamp)

            &&

            timestamp > 0

        );

    }

    /**
     * Validates trading pair constraints.
     */
    static order(

        pair: Pair,

        quantity: number,

        price: number

    ): boolean {

        if (

            !this.quantity(quantity)

            ||

            !this.price(price)

        ) {

            return false;

        }

        if (

            quantity < pair.minQuantity

        ) {

            return false;

        }

        if (

            pair.maxQuantity !== undefined

            &&

            quantity > pair.maxQuantity

        ) {

            return false;

        }

        if (

            !pair.tradingEnabled

        ) {

            return false;

        }

        if (

            pair.status !== "ACTIVE"

        ) {

            return false;

        }

        return true;

    }

}
