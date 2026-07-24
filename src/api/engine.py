import time
from indodax_api import IndodaxAPI
from strategy import Strategy
from config import PAIR, INTERVAL_SECONDS, TRADE_AMOUNT_IDR, STOP_LOSS_PCT, TAKE_PROFIT_PCT

class TradingEngine:
    def __init__(self):
        self.api = IndodaxAPI()
        self.price_history = []
        self.in_position = False
        self.buy_price = 0.0

    def run(self):
        print(f"🚀 [AutoIDX Engine Started] Monitoring Pair: {PAIR.upper()}...")

        while True:
            try:
                ticker = self.api.get_ticker(PAIR)
                if not ticker:
                    time.sleep(INTERVAL_SECONDS)
                    continue

                current_price = float(ticker['last'])
                self.price_history.append(current_price)

                # Jaga panjang memori data harga secukupnya
                if len(self.price_history) > 100:
                    self.price_history.pop(0)

                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {PAIR.upper()} Price: Rp {current_price:,.0f}")

                # 1. Cek Stop Loss & Take Profit jika sedang hold aset
                if self.in_position:
                    price_change = (current_price - self.buy_price) / self.buy_price
                    
                    if price_change <= -STOP_LOSS_PCT:
                        print(f"🚨 [STOP LOSS] Triggered at Rp {current_price:,.0f} ({price_change*100:.2f}%)")
                        self.execute_sell(current_price)
                        continue

                    elif price_change >= TAKE_PROFIT_PCT:
                        print(f"🎯 [TAKE PROFIT] Triggered at Rp {current_price:,.0f} (+{price_change*100:.2f}%)")
                        self.execute_sell(current_price)
                        continue

                # 2. Analisa Strategi
                signal = Strategy.analyze(pd.Series(self.price_history))
                
                if signal == "BUY" and not self.in_position:
                    print("💡 [SIGNAL] Beli Terdeteksi!")
                    self.execute_buy(current_price)
                elif signal == "SELL" and self.in_position:
                    print("💡 [SIGNAL] Jual Terdeteksi!")
                    self.execute_sell(current_price)

            except Exception as e:
                print(f"[ENGINE ERROR] {e}")

            time.sleep(INTERVAL_SECONDS)

    def execute_buy(self, price):
        # Eksekusi logika beli
        coin_amount = TRADE_AMOUNT_IDR / price
        print(f"🛒 Executing BUY Order: {coin_amount:.8f} BTC @ Rp {price:,.0f}")
        # res = self.api.create_order(PAIR, 'buy', price, coin_amount)
        self.in_position = True
        self.buy_price = price

    def execute_sell(self, price):
        # Eksekusi logika jual
        print(f"💰 Executing SELL Order @ Rp {price:,.0f}")
        # res = self.api.create_order(PAIR, 'sell', price, coin_amount)
        self.in_position = False
        self.buy_price = 0.0
