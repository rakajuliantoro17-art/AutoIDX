/**
==========================================================
AURA Trade OS
Order Validator
Version : 0.1.0 Alpha
==========================================================
Order Validation Helpers
==========================================================
*/

import { ValidationError } from "@/errors";



/*
==========================================================
Supported Order Types
==========================================================
*/

export const SUPPORTED_ORDER_TYPES = [

    "MARKET",

    "LIMIT",

    "STOP",

    "TAKE_PROFIT",

] as const;

export type SupportedOrderType =
    typeof SUPPORTED_ORDER_TYPES[number];





/*
==========================================================
Supported Order Sides
==========================================================
*/

export const SUPPORTED_ORDER_SIDES = [

    "BUY",

    "SELL",

] as const;

export type SupportedOrderSide =
    typeof SUPPORTED_ORDER_SIDES[number];





/*
==========================================================
Order Side
==========================================================
*/

export function validateOrderSide(
    side: string
): SupportedOrderSide {

    const value = side.toUpperCase();

    if (

        !SUPPORTED_ORDER_SIDES.includes(

            value as SupportedOrderSide

        )

    ) {

        throw new ValidationError({

            message: "Invalid order side.",

            code: "INVALID_VALUE",

            field: "side",

            value,

        });

    }

    return value as SupportedOrderSide;

}





/*
==========================================================
Order Type
==========================================================
*/

export function validateOrderType(
    type: string
): SupportedOrderType {

    const value = type.toUpperCase();

    if (

        !SUPPORTED_ORDER_TYPES.includes(

            value as SupportedOrderType

        )

    ) {

        throw new ValidationError({

            message: "Unsupported order type.",

            code: "INVALID_VALUE",

            field: "type",

            value,

        });

    }

    return value as SupportedOrderType;

}





/*
==========================================================
Quantity
==========================================================
*/

export function validateQuantity(
    quantity: number
): number {

    if (

        !Number.isFinite(quantity) ||

        quantity <= 0

    ) {

        throw new ValidationError({

            message: "Quantity must be greater than zero.",

            code: "INVALID_QUANTITY",

            field: "quantity",

            value: quantity,

        });

    }

    return quantity;

}





/*
==========================================================
Price
==========================================================
*/

export function validateOrderPrice(
    price: number
): number {

    if (

        !Number.isFinite(price) ||

        price <= 0

    ) {

        throw new ValidationError({

            message: "Order price must be greater than zero.",

            code: "INVALID_PRICE",

            field: "price",

            value: price,

        });

    }

    return price;

}





/*
==========================================================
Stop Price
==========================================================
*/

export function validateStopPrice(
    stopPrice: number
): number {

    if (

        !Number.isFinite(stopPrice) ||

        stopPrice <= 0

    ) {

        throw new ValidationError({

            message: "Invalid stop price.",

            code: "INVALID_PRICE",

            field: "stopPrice",

            value: stopPrice,

        });

    }

    return stopPrice;

}





/*
==========================================================
Limit Order
==========================================================
*/

export function validateLimitOrder(

    quantity: number,

    price: number,

): boolean {

    validateQuantity(quantity);

    validateOrderPrice(price);

    return true;

}





/*
==========================================================
Stop Order
==========================================================
*/

export function validateStopOrder(

    quantity: number,

    stopPrice: number,

): boolean {

    validateQuantity(quantity);

    validateStopPrice(stopPrice);

    return true;

}





/*
==========================================================
Market Order
==========================================================
*/

export function validateMarketOrder(
    quantity: number
): boolean {

    validateQuantity(quantity);

    return true;

}





/*
==========================================================
Client Order ID
==========================================================
*/

export function validateClientOrderId(
    id: string
): string {

    const value = id.trim();

    if (!value.length) {

        throw new ValidationError({

            message: "Client order ID is required.",

            code: "REQUIRED_FIELD",

            field: "clientOrderId",

        });

    }

    return value;

}

