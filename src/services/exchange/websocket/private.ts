/**
==========================================================
AURA Trade OS
Private WebSocket Client
Version : 0.1.1 Alpha
==========================================================
*/

import { ReconnectManager } from "./reconnect";

export interface PrivateWebSocketOptions {

    url: string;

    token?: string;

}

export type PrivateMessageHandler =

    (payload: unknown) => void;

export class PrivateWebSocketClient {

    private socket?: WebSocket;

    private readonly reconnect =

        new ReconnectManager();

    private handlers =

        new Set<PrivateMessageHandler>();

    constructor(

        private readonly options: PrivateWebSocketOptions

    ) {}

    /**
     * Connects to websocket.
     */
    connect(): void {

        this.socket =

            new WebSocket(

                this.options.url

            );

        this.socket.onopen = () => {

            this.reconnect.reset();

            this.authenticate();

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
     * Authenticate channel.
     */
    protected authenticate(): void {

        if (

            !this.options.token ||

            !this.socket

        ) {

            return;

        }

        this.socket.send(

            JSON.stringify({

                op: "auth",

                token: this.options.token,

            })

        );

    }

    /**
     * Subscribe message listener.
     */
    onMessage(

        handler: PrivateMessageHandler

    ): void {

        this.handlers.add(handler);

    }

    /**
     * Remove listener.
     */
    offMessage(

        handler: PrivateMessageHandler

    ): void {

        this.handlers.delete(handler);

    }

    /**
     * Send raw payload.
     */
    send(

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
