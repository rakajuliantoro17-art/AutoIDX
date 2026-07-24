import pandas as pd

class Strategy:
    @staticmethod
    def calculate_rsi(prices, period=14):
        """Menghitung nilai RSI."""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @staticmethod
    def analyze(price_history, fast_p=9, slow_p=21, rsi_p=14):
        """
        Mengembalikan sinyal: 'BUY', 'SELL', atau 'HOLD'
        """
        if len(price_history) < slow_p + 1:
            return "HOLD"  # Data belum cukup

        df = pd.DataFrame({'price': price_history})
        df['ema_fast'] = df['price'].ewm(span=fast_p, adjust=False).mean()
        df['ema_slow'] = df['price'].ewm(span=slow_p, adjust=False).mean()
        df['rsi'] = Strategy.calculate_rsi(df['price'], rsi_p)

        last = df.iloc[-1]
        prev = df.iloc[-2]

        # Sinyal Beli: EMA Crossover Atas & RSI < 50
        bullish_cross = (prev['ema_fast'] <= prev['ema_slow']) and (last['ema_fast'] > last['ema_slow'])
        if bullish_cross and last['rsi'] < 50:
            return "BUY"

        # Sinyal Jual: EMA Crossover Bawah atau RSI Overbought
        bearish_cross = (prev['ema_fast'] >= prev['ema_slow']) and (last['ema_fast'] < last['ema_slow'])
        if bearish_cross or last['rsi'] > 70:
            return "SELL"

        return "HOLD"