import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ambil data ticker publik langsung dari Indodax API
    const response = await fetch('https://indodax.com/api/btc_idr/ticker', {
      next: { revalidate: 10 },
    });
    
    const data = await response.json();
    const lastPrice = parseFloat(data.ticker.last);

    return NextResponse.json({
      status: 'success',
      pair: 'BTC/IDR',
      lastPrice: lastPrice,
      rsi: 48.5, // Dummy calculated indicator
      signal: 'HOLD',
      inPosition: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
