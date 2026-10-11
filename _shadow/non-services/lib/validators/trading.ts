/**
==========================================================
AURA Trade OS
Trading Validator
Version : 0.1.0 Alpha
==========================================================
Trading Validation Helpers
==========================================================
*/

import { ValidationError } from "@/errors";

import {

    MAX_CONFIDENCE,

    MAX_EXPOSURE_PERCENT,

    MAX_POSITION_PERCENT,

    MAX_LEVERAGE,

    MAX_SINGLE_TRADE_LOSS_PERCENT,

    MIN_CONFIDENCE,

} from "@/config/limits";





/*
==========================================================
Confidence
==========================================================
*/

export function validateConfidence(
    confidence: number
): number {

    if (

        !Number.isFinite(confidence)

    ) {

        throw new ValidationError({

            message: "Confidence must be a valid number.",

            code: "INVALID_VALUE",

            field: "confidence",

            value: confidence,

        });

    }

    if (

        confidence < MIN_CONFIDENCE ||

        confidence > MAX_CONFIDENCE

    ) {

        throw new ValidationError({

            message: `Confidence must be between ${MIN_CONFIDENCE} and ${MAX_CONFIDENCE}.`,

            code: "OUT_OF_RANGE",

            field: "confidence",

            value: confidence,

        });

    }

    return confidence;

}





/*
==========================================================
Exposure
==========================================================
*/

export function validateExposure(
    exposurePercent: number
): number {

    if (

        exposurePercent < 0 ||

        exposurePercent > MAX_EXPOSURE_PERCENT

    ) {

        throw new ValidationError({

            message: "Exposure exceeds allowed limit.",

            code: "OUT_OF_RANGE",

            field: "exposure",

            value: exposurePercent,

        });

    }

    return exposurePercent;

}





/*
==========================================================
Position Size
==========================================================
*/

export function validatePositionSize(
    percent: number
): number {

    if (

        percent <= 0 ||

        percent > MAX_POSITION_PERCENT

    ) {

        throw new ValidationError({

            message: "Invalid position size.",

            code: "OUT_OF_RANGE",

            field: "positionSize",

            value: percent,

        });

    }

    return percent;

}





/*
==========================================================
Leverage
==========================================================
*/

export function validateLeverage(
    leverage: number
): number {

    if (

        leverage <= 0 ||

        leverage > MAX_LEVERAGE

    ) {

        throw new ValidationError({

            message: "Invalid leverage.",

            code: "OUT_OF_RANGE",

            field: "leverage",

            value: leverage,

        });

    }

    return leverage;

}





/*
==========================================================
Stop Loss
==========================================================
*/

export function validateStopLossPercent(
    percent: number
): number {

    if (

        percent <= 0 ||

        percent > MAX_SINGLE_TRADE_LOSS_PERCENT

    ) {

        throw new ValidationError({

            message: "Stop loss exceeds allowed risk.",

            code: "OUT_OF_RANGE",

            field: "stopLoss",

            value: percent,

        });

    }

    return percent;

}





/*
==========================================================
Risk Reward Ratio
==========================================================
*/

export function validateRiskRewardRatio(
    ratio: number
): number {

    if (

        !Number.isFinite(ratio) ||

        ratio < 1

    ) {

        throw new ValidationError({

            message: "Risk reward ratio must be at least 1.",

            code: "OUT_OF_RANGE",

            field: "riskReward",

            value: ratio,

        });

    }

    return ratio;

}





/*
==========================================================
Trading Capital
==========================================================
*/

export function validateCapital(
    capital: number
): number {

    if (

        !Number.isFinite(capital) ||

        capital <= 0

    ) {

        throw new ValidationError({

            message: "Trading capital must be greater than zero.",

            code: "INVALID_VALUE",

            field: "capital",

            value: capital,

        });

    }

    return capital;

}





/*
==========================================================
Trade Decision
==========================================================
*/

export function validateTradeDecision(
    action: string
): string {

    const value = action.toUpperCase();

    if (

        value !== "BUY" &&

        value !== "SELL" &&

        value !== "HOLD"

    ) {

        throw new ValidationError({

            message: "Invalid trading decision.",

            code: "INVALID_VALUE",

            field: "action",

            value,

        });

    }

    return value;

}

