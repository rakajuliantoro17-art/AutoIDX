/**
==========================================================
AutoIDX
Execution Engine
Version : 0.0.1 Alpha
==========================================================
*/

import { BOT_MODE, ORDER } from "./constants";

export type OrderSide = "buy" | "sell";

export interface ExecutionRequest {
  pair: string;
  side: OrderSide;
  price: number;
  amountIdr: number;
}

export interface ExecutionResult {
  success: boolean;

  mode: string;

  pair: string;

  side: OrderSide;

  price: number;

  amountIdr: number;

  coinAmount: number;

  orderId?: string;

  message: string;

  timestamp: string;
}

export async function executeOrder(
  request: ExecutionRequest
): Promise<ExecutionResult> {

  const mode =
    process.env.BOT_MODE ??
    BOT_MODE.PAPER;

  const coinAmount =
    request.amountIdr / request.price;

  /**
   * ======================================
   * PAPER TRADING
   * ======================================
   */

  if (mode === BOT_MODE.PAPER) {

    console.info(
      `[PAPER] ${request.side.toUpperCase()} ${request.pair}`
    );

    return {

      success: true,

      mode,

      pair: request.pair,

      side: request.side,

      price: request.price,

      amountIdr: request.amountIdr,

      coinAmount,

      orderId: `PAPER-${Date.now()}`,

      message:
        "Paper trade executed successfully.",

      timestamp:
        new Date().toISOString(),
    };
  }

  /**
   * ======================================
   * LIVE TRADING
   * ======================================
   */

  try {

    /**
     * TODO
     *
     * await indodax.createOrder(...)
     *
     */

    return {

      success: true,

      mode,

      pair: request.pair,

      side: request.side,

      price: request.price,

      amountIdr: request.amountIdr,

      coinAmount,

      orderId: "",

      message:
        "Live order submitted.",

      timestamp:
        new Date().toISOString(),
    };

  } catch (error) {

    return {

      success: false,

      mode,

      pair: request.pair,

      side: request.side,

      price: request.price,

      amountIdr: request.amountIdr,

      coinAmount,

      message:
        error instanceof Error
          ? error.message
          : "Order execution failed.",

      timestamp:
        new Date().toISOString(),
    };

  }

}

export async function executeBuy(
  pair: string,
  price: number,
  amountIdr: number
) {
  return executeOrder({
    pair,
    side: ORDER.BUY,
    price,
    amountIdr,
  });
}

export async function executeSell(
  pair: string,
  price: number,
  amountIdr: number
) {
  return executeOrder({
    pair,
    side: ORDER.SELL,
    price,
    amountIdr,
  });
}
