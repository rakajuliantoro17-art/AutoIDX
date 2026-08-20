/**
==========================================================
AURA Trade OS
Backtest Simulator
Version : 0.2.0 Alpha
==========================================================
Strategy Simulation Runtime

PERBAIKAN BESAR dari 0.1.0 -- versi lama punya beberapa bug
yang membuat hasil backtest TIDAK VALID untuk memvalidasi
strategi yang sekarang jalan live:

1. Feature vector yang dikirim ke strategy cuma
   { close, volume, timestamp } -- rsi/emaFast/emaSlow/macd/atr/
   adx/stochastic/bollinger semuanya undefined. filterRules dan
   entryRules AURA_TREND/EMA_CROSSOVER/MOMENTUM praktis selalu
   gagal tanpa data ini. Sekarang pakai buildFeatureVector() yang
   SAMA PERSIS dipakai cron.ts di jalur live (services/strategy/
   featureBuilder.ts), dihitung dari rolling window candle asli.

2. Posisi (NONE/LONG) tidak pernah dilacak/dikirim ke strategy --
   selalu default "NONE", jadi exitRules (SELL) TIDAK PERNAH
   dievaluasi sepanjang backtest. Posisi yang sudah dibeli tidak
   akan pernah dijual lewat sinyal strategi. Sekarang posisi
   dilacak dari VirtualPortfolio.hasOpenPosition().

3. Parameter `strategy` dari request API (mis. "AURA_TREND")
   tidak pernah benar-benar dipakai -- backtest selalu jalan
   pakai mode aktif strategyManager saat itu. Sekarang dipilih
   eksplisit lewat core/strategyEngine.evaluate(strategyName, ...)
   -- LANGSUNG ke engine tingkat rendah, BUKAN lewat
   strategyManager.setMode(), supaya TIDAK mengubah mode yang
   sedang dipakai trading LIVE (strategyManager adalah singleton
   yang di-share dengan services/trading/engine.ts -- mengubah
   activeMode-nya dari sini bisa mengacaukan siklus live yang
   kebetulan berjalan bersamaan di server yang sama).

4. Tidak ada simulasi stop-loss/take-profit sama sekali -- posisi
   cuma ditutup kalau strategi eksplisit bilang SELL. Sekarang
   pakai RiskManager.calculateAtrStopLevels/evaluateWithLevels
   (module yang SAMA dipakai live engine.ts) supaya backtest
   punya fidelitas perilaku yang sama dengan live.

Lihat juga portfolio/virtualPortfolio.ts (positionManager yang
sebelumnya singleton di-share lintas semua backtest run --
diperbaiki terpisah).
==========================================================
*/


import type {

    BacktestCandle,

    BacktestConfig,

    BacktestTrade,

    EquityPoint

}

from "./types";

import coreStrategyEngine

from "@/services/strategy/core/strategyEngine";

import strategyManager

from "@/services/strategy/manager";

import type { IndicatorFeatureVector } from "@/services/indicators";

import { buildFeatureVector, MIN_CANDLES_FOR_FEATURES } from "@/services/strategy/featureBuilder";

import type { Candle } from "@/services/indodax/candles";

import RiskManager from "@/services/trading/risk";

import orderSimulator

from "./execution/orderSimulator";

import fillSimulator

from "./execution/fillSimulator";

import VirtualPortfolio

from "./portfolio/virtualPortfolio";



const VALID_STRATEGY_NAMES = [
  "AURA_TREND",
  "EMA_CROSSOVER",
  "MOMENTUM",
];

function resolveStrategyName(requested: string): string {
  return VALID_STRATEGY_NAMES.includes(requested)
    ? requested
    : "AURA_TREND";
}

/**
 * Adaptor: BacktestCandle[] -> Candle[] (bentuk yang diharapkan
 * buildFeatureVector, sama persis dipakai jalur live cron.ts).
 * Field-nya identik kecuali nama field waktu (timestamp vs time).
 */
function toIndicatorCandles(candles: BacktestCandle[]): Candle[] {
  return candles.map((c) => ({
    time: c.timestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
  }));
}



export class BacktestSimulator {



    private portfolio:VirtualPortfolio;


    private trades:BacktestTrade[];


    private equityCurve:EquityPoint[];


    private strategyName:string;


    private candleHistory:BacktestCandle[];


    private stopLossPrice:number;


    private takeProfitPrice:number;




    constructor(

        private config:BacktestConfig

    ){

        this.portfolio =

            new VirtualPortfolio({

                initialCapital:

                    config.initialCapital,

                feeRate:

                    config.feeRate

            });

        this.trades=[];

        this.equityCurve=[];

        this.candleHistory=[];

        this.stopLossPrice=0;

        this.takeProfitPrice=0;

        this.strategyName =
            resolveStrategyName(config.strategy);

        // Memastikan ketiga strategi (AURA_TREND/EMA_CROSSOVER/
        // MOMENTUM) sudah terdaftar di core/strategyEngine --
        // idempotent, murni efek samping registrasi, TIDAK
        // menyentuh activeMode singleton (aman dipanggil dari
        // backtest tanpa risiko mengganggu live trading).
        strategyManager.initialize();

    }




    /**
     * Run one candle simulation
     */
    processCandle(

        candle:BacktestCandle

    ){

        this.candleHistory.push(candle);

        const hasOpenPosition =
            this.portfolio.hasOpenPosition();

        // --- 1. Cek stop-loss/take-profit paksa (kalau sedang
        //    posisi) -- dicek TERPISAH dari sinyal strategi, sama
        //    persis urutan di live engine.ts, supaya posisi tetap
        //    ditutup walau strategi belum kasih sinyal SELL. ---
        if (hasOpenPosition && this.stopLossPrice > 0) {

            const position = this.portfolio.getPositionSnapshot();

            const riskEval = RiskManager.evaluateWithLevels(
                position ? position.entryPrice : 0,
                candle.close,
                true,
                this.stopLossPrice,
                this.takeProfitPrice
            );

            if (riskEval.shouldStopLoss || riskEval.shouldTakeProfit) {

                this.executeSell(candle);

                this.stopLossPrice = 0;
                this.takeProfitPrice = 0;

                this.portfolio.updatePrice(candle.close);
                this.recordEquity(candle.timestamp);

                return;

            }

        }

        // Belum cukup data historis untuk menghitung indikator
        // penuh (MACD butuh paling banyak, 35 candle) -- sama
        // persis ambang MIN_CANDLES_FOR_FEATURES yang dipakai
        // cron.ts di jalur live. Sebelum itu, HOLD saja.
        if (this.candleHistory.length >= MIN_CANDLES_FOR_FEATURES) {

            const features: IndicatorFeatureVector = buildFeatureVector(
                candle.pair,
                toIndicatorCandles(this.candleHistory)
            );

            const position: "NONE" | "LONG" =
                hasOpenPosition ? "LONG" : "NONE";

            const decision = coreStrategyEngine.evaluate(
                this.strategyName,
                features,
                position
            );

            if (decision?.action === "BUY" && !hasOpenPosition) {

                const filledPrice = this.executeBuy(candle);

                if (filledPrice !== null) {

                    const atrLevels =
                        RiskManager.calculateAtrStopLevels(
                            filledPrice,
                            features.atr
                        );

                    this.stopLossPrice = atrLevels.stopLossPrice;
                    this.takeProfitPrice = atrLevels.takeProfitPrice;

                }

            }

            if (decision?.action === "SELL" && hasOpenPosition) {

                this.executeSell(candle);

                this.stopLossPrice = 0;
                this.takeProfitPrice = 0;

            }

        }


        this.portfolio.updatePrice(

            candle.close

        );


        this.recordEquity(

            candle.timestamp

        );


    }




    /**
     * Execute BUY. Mengembalikan harga eksekusi (null kalau order
     * tidak terisi) -- dipakai untuk menghitung level ATR SL/TP.
     */
    private executeBuy(

        candle:BacktestCandle

    ): number | null {


        const amount =

            this.calculateAmount(

                candle.close

            );


        const order =

            orderSimulator.execute({


                pair:

                    candle.pair,


                side:

                    "BUY",


                price:

                    candle.close,


                amount,


                timestamp:

                    candle.timestamp


            });



        const fill =

            fillSimulator.fill(

                order,

                {


                    volume:

                        candle.volume,


                    averageVolume:

                        candle.volume,


                    spread:

                        0.001,


                    volatility:

                        0.02


                }

            );



        if(fill.status==="FILLED"){

            this.portfolio.buy(

                candle.pair,

                fill.executionPrice,

                fill.filledAmount

            );

            return fill.executionPrice;

        }

        return null;

    }




    /**
     * Execute SELL
     */
    private executeSell(

        candle:BacktestCandle

    ){


        const closed =

            this.portfolio.sell(

                candle.close

            );


        if(!closed)

            return;



        this.trades.push({


            id:

                "TRD-"+Date.now(),


            pair:

                closed.pair,


            entryPrice:

                closed.entryPrice,


            exitPrice:

                closed.exitPrice,


            quantity:

                closed.quantity,


            profitLoss:

                closed.profitLoss,


            returnPercent:

                closed.returnPercent,


            duration:

                closed.closedAt -

                closed.openedAt,


            openedAt:

                closed.openedAt,


            closedAt:

                closed.closedAt


        });

    }




    private calculateAmount(

        price:number

    ){

        return (

            this.config.initialCapital *

            0.95

        )

        /

        price;

    }




    private recordEquity(

        timestamp:number

    ){

        const snapshot =

            this.portfolio.snapshot();


        this.equityCurve.push({


            timestamp,

            equity:

                snapshot.equity,

            cash:

                snapshot.cash,

            assetValue:

                snapshot.assetValue


        });

    }




    /**
     * Final simulation result
     */
    result(){

        return {


            trades:

                this.trades,


            equityCurve:

                this.equityCurve,


            portfolio:

                this.portfolio.getBalance()


        };

    }


}



export default BacktestSimulator;
