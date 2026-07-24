import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("INDODAX_API_KEY")
SECRET_KEY = os.getenv("INDODAX_SECRET_KEY")

# Pengaturan Pair & Trading
PAIR = "btc_idr"           # Contoh pair Indodax
INTERVAL_SECONDS = 60      # Loop time execution (1 menit)
TRADE_AMOUNT_IDR = 50000   # Nominal beli dalam IDR per transaksi

# Indikator Technical
EMA_FAST = 9
EMA_SLOW = 21
RSI_PERIOD = 14
RSI_OVERSOLD = 30          # Sinyal Beli
RSI_OVERBOUGHT = 70        # Sinyal Jual

# Manajemen Risiko
STOP_LOSS_PCT = 0.02       # Stop Loss 2%
TAKE_PROFIT_PCT = 0.04     # Take Profit 4%
