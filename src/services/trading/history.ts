/**
==========================================================
AURA Trade OS
Trading History Service
Version : 0.0.6 Alpha
==========================================================
*/

import {
  recordTrade,
  TradeLog,
} from "@/services/firebase/logService";

export interface HistoryRecord {
  id?: string;

  pair: string;

  side: "BUY" | "SELL";

  price: number;

  amount: number;

  total: number;

  reason: string;

  timestamp: string;
}

export class TradingHistory {

  /**
   * Simpan transaksi ke Firestore
   */
  static async save(
    record: Omit<HistoryRecord, "timestamp">
  ): Promise<string | null> {

    return await recordTrade({

      pair: record.pair,

      type: record.side,

      price: record.price,

      amount: record.amount,

      totalIdr: record.total,

      reason: record.reason,

    });

  }

  /**
   * Konversi TradeLog menjadi HistoryRecord
   */
  static fromTradeLog(
    trade: TradeLog
  ): HistoryRecord {

    return {

      id: trade.id,

      pair: trade.pair,

      side: trade.type,

      price: trade.price,

      amount: trade.amount,

      total: trade.totalIdr,

      reason: trade.reason,

      timestamp: trade.timestamp,

    };

  }

  /**
   * Ringkasan transaksi
   */
  static summarize(
    history: HistoryRecord[]
  ) {

    const totalTrades =
      history.length;

    const buyTrades =
      history.filter(
        (x) => x.side === "BUY"
      ).length;

    const sellTrades =
      history.filter(
        (x) => x.side === "SELL"
      ).length;

    const totalVolume =
      history.reduce(
        (sum, item) => sum + item.total,
        0
      );

    return {

      totalTrades,

      buyTrades,

      sellTrades,

      totalVolume,

    };

  }

  /**
   * Filter berdasarkan pair
   */
  static filterByPair(
    history: HistoryRecord[],
    pair: string
  ): HistoryRecord[] {

    return history.filter(
      (item) =>
        item.pair.toLowerCase() ===
        pair.toLowerCase()
    );

  }

  /**
   * Filter berdasarkan BUY/SELL
   */
  static filterBySide(
    history: HistoryRecord[],
    side: "BUY" | "SELL"
  ): HistoryRecord[] {

    return history.filter(
      (item) => item.side === side
    );

  }

  /**
   * Urutkan terbaru
   */
  static sortNewest(
    history: HistoryRecord[]
  ): HistoryRecord[] {

    return [...history].sort(

      (a, b) =>

        new Date(b.timestamp).getTime() -

        new Date(a.timestamp).getTime()

    );

  }

}

export default TradingHistory;
