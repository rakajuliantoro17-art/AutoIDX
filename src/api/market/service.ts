const BASE_URL = "https://indodax.com/api";

export async function getTicker(pair: string) {

    const response = await fetch(
        `${BASE_URL}/${pair}/ticker`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        return null;
    }

    const json = await response.json();

    return json.ticker;

}
