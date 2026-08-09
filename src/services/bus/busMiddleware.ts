/**
==========================================================
AURA Trade OS
Bus Middleware
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    BusMessage,
} from "./busMessage";

import type {
    BusContext,
} from "./busContext";

import type {
    BusResult,
} from "./busResult";

export type BusMiddleware = (
    message: BusMessage,
    context: BusContext,
    next: (
        message: BusMessage,
        context: BusContext,
    ) => BusResult | Promise<BusResult>,
) => BusResult | Promise<BusResult>;

export class BusMiddlewareChain {
    private readonly items:
        BusMiddleware[] = [];

    public use(
        middleware: BusMiddleware,
    ): this {
        this.items.push(
            middleware,
        );

        return this;
    }

    public async execute(
        message: BusMessage,
        context: BusContext,
        terminal: (
            message: BusMessage,
            context: BusContext,
        ) => BusResult | Promise<BusResult>,
    ): Promise<BusResult> {
        let index = -1;

        const dispatch =
            async (
                currentMessage: BusMessage,
                currentContext: BusContext,
            ): Promise<BusResult> => {
                index += 1;

                if (
                    index >=
                    this.items.length
                ) {
                    return terminal(
                        currentMessage,
                        currentContext,
                    );
                }

                return this.items[index](
                    currentMessage,
                    currentContext,
                    dispatch,
                );
            };

        return dispatch(
            message,
            context,
        );
    }

    public clear(): void {
        this.items.length = 0;
    }

    public size(): number {
        return this.items.length;
    }
}

export default BusMiddlewareChain;
