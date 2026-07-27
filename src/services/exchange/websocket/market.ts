/**
==========================================================
AURA Trade OS
Market WebSocket Client
Version : 0.1.1 Alpha
==========================================================
*/

import { ReconnectManager } from "./reconnect";

export interface MarketWebSocketOptions {

    url: string;

}

export type MarketMessageHandler =

    (payload: unknown) => void;

export class MarketWebSocketClient {

    private socket?: WebSocket;

    private readonly reconnect =

        new ReconnectManager();

    private readonly handlers =

        new Set<MarketMessageHandler>();

    private readonly subscriptions =

        new Set<string>();

    constructor(

        private readonly options: MarketWebSocketOptions

    ) {}

    /**
     * Connect websocket.
     */
    connect(): void {

        this.socket =

            new WebSocket(

                this.options.url

            );

        this.socket.onopen = () => {

            this.reconnect.reset();

            this.restoreSubscriptions();

        };

        this.socket.onmessage = (

            event

        ) => {

            const payload =

                JSON.parse(

                    event.data

                );

            this.handlers.forEach(

                handler =>

                    handler(payload)

            );

        };

        this.socket.onclose = () => {

            const delay =

                this.reconnect.nextDelay();

            setTimeout(

                () =>

                    this.connect(),

                delay

            );

        };

    }

    /**
     * Subscribe channel.
     */
    subscribe(

        channel: string

    ): void {

        this.subscriptions.add(channel);

        this.send({

            op: "subscribe",

            channel,

        });

    }

    /**
     * Unsubscribe channel.
     */
    unsubscribe(

        channel: string

    ): void {

        this.subscriptions.delete(channel);

        this.send({

            op: "unsubscribe",

            channel,

        });

    }

    /**
     * Restore subscriptions
     * after reconnect.
     */
    protected restoreSubscriptions(): void {

        this.subscriptions.forEach(

            channel =>

                this.send({

                    op: "subscribe",

                    channel,

                })

        );

    }

    /**
     * Register message listener.
     */
    onMessage(

        handler: MarketMessageHandler

    ): void {

        this.handlers.add(handler);

    }

    /**
     * Remove listener.
     */
    offMessage(

        handler: MarketMessageHandler

    ): void {

        this.handlers.delete(handler);

    }

    /**
     * Send payload.
     */
    protected send(

        payload: unknown

    ): void {

        if (

            this.socket?.readyState ===

            WebSocket.OPEN

        ) {

            this.socket.send(

                JSON.stringify(payload)

            );

        }

    }

    /**
     * Close websocket.
     */
    close(): void {

        this.socket?.close();

    }

}
