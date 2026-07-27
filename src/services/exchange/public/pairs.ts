/**
==========================================================
AURA Trade OS
Public Pair Service
Version : 0.1.1 Alpha
==========================================================
*/

import { PublicClient } from "./client";

import type {

    Pair,

} from "../models/pair";

export class PairService {

    constructor(

        private readonly client: PublicClient

    ) {}

    /**
     * Returns all trading pairs.
     */
    async getAll(): Promise<Pair[]> {

        return this.client.get<Pair[]>(

            "/pairs"

        );

    }

    /**
     * Returns one trading pair.
     */
    async get(

        symbol: string

    ): Promise<Pair | null> {

        const pairs =

            await this.getAll();

        return (

            pairs.find(

                pair =>

                    pair.symbol ===

                    symbol

            ) ?? null

        );

    }

    /**
     * Returns active pairs.
     */
    async active(): Promise<Pair[]> {

        const pairs =

            await this.getAll();

        return pairs.filter(

            pair =>

                pair.status === "ACTIVE"

                &&

                pair.tradingEnabled

        );

    }

    /**
     * Returns visible pairs.
     */
    async visible(): Promise<Pair[]> {

        const pairs =

            await this.getAll();

        return pairs.filter(

            pair =>

                pair.visible

        );

    }

    /**
     * Returns pairs by quote asset.
     */
    async byQuote(

        quoteAsset: string

    ): Promise<Pair[]> {

        const pairs =

            await this.getAll();

        return pairs.filter(

            pair =>

                pair.quoteAsset ===

                quoteAsset

        );

    }

    /**
     * Returns pairs by base asset.
     */
    async byBase(

        baseAsset: string

    ): Promise<Pair[]> {

        const pairs =

            await this.getAll();

        return pairs.filter(

            pair =>

                pair.baseAsset ===

                baseAsset

        );

    }

}

export default PairService;
