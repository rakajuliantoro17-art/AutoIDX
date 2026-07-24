import { DEFAULT_PAIRS } from "./constants";
import { getTicker } from "./service";

export async function scanMarket() {

    const results = [];

    for (const pair of DEFAULT_PAIRS) {

        const ticker =
            await getTicker(pair);

        if (!ticker)
            continue;

        results.push({

            pair,

            price: Number(ticker.last),

            buy: Number(ticker.buy),

            sell: Number(ticker.sell),

            high: Number(ticker.high),

            low: Number(ticker.low),

            volume:
                Number(
                    ticker.vol_idr ?? 0
                )

        });

    }

    return results;

}
