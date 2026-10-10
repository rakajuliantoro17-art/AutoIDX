/**
==========================================================
AURA Trade OS
Indodax Order Book Service
Version : 0.0.5 Alpha
==========================================================
*/

export interface OrderBookItem {
  price: number;
  amount: number;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookItem[];
  asks: OrderBookItem[];
  timestamp: string;
}

export interface OrderBookOptions {
  pair?: string;
  limit?: number;
}

const DEFAULT_PAIR = "btcidr";
const DEFAULT_LIMIT = 20;

/**
 * Mengambil Order Book (Depth) dari Indodax
 */
export async function getOrderBook(
  options: OrderBookOptions = {}
): Promise<OrderBook> {

  const pair = options.pair ?? DEFAULT_PAIR;
  const limit = options.limit ?? DEFAULT_LIMIT;

  try {

    const response = await fetch(
      `https://indodax.com/api/${pair}/depth`,
      {
        next: {
          revalidate: 5,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const bids: OrderBookItem[] =
      (data.buy ?? [])
        .slice(0, limit)
        .map((item: [string, string]) => ({
          price: Number(item[0]),
          amount: Number(item[1]),
        }));

    const asks: OrderBookItem[] =
      (data.sell ?? [])
        .slice(0, limit)
        .map((item: [string, string]) => ({
          price: Number(item[0]),
          amount: Number(item[1]),
        }));

    return {
      pair,
      bids,
      asks,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {

    console.error("[Indodax OrderBook Error]", error);

    return {
      pair,
      bids: [],
      asks: [],
      timestamp: new Date().toISOString(),
    };

  }

}

/**
 * Bid (harga beli) terbaik
 */
export async function getBestBid(
  pair: string = DEFAULT_PAIR
): Promise<OrderBookItem | null> {

  const book = await getOrderBook({
    pair,
    limit: 1,
  });

  return book.bids.length
    ? book.bids[0]
    : null;

}

/**
 * Ask (harga jual) terbaik
 */
export async function getBestAsk(
  pair: string = DEFAULT_PAIR
): Promise<OrderBookItem | null> {

  const book = await getOrderBook({
    pair,
    limit: 1,
  });

  return book.asks.length
    ? book.asks[0]
    : null;

}

/**
 * Spread saat ini
 */
export async function getSpread(
  pair: string = DEFAULT_PAIR
): Promise<number> {

  const [bid, ask] = await Promise.all([
    getBestBid(pair),
    getBestAsk(pair),
  ]);

  if (!bid || !ask) {
    return 0;
  }

  return ask.price - bid.price;

}

export default {

  getOrderBook,

  getBestBid,

  getBestAsk,

  getSpread,

};
