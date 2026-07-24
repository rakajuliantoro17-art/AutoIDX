import hashlib
import hmac
import time
import requests
import urllib.parse
from config import API_KEY, SECRET_KEY

class IndodaxAPI:
    BASE_URL_PUBLIC = "https://indodax.com/api"
    BASE_URL_PRIVATE = "https://indodax.com/tapi"

    def __init__(self):
        self.api_key = API_KEY
        self.secret_key = SECRET_KEY.encode('utf-8') if SECRET_KEY else b''

    def get_ticker(self, pair="btc_idr"):
        """Mengambil data ticker publik (Harga terakhir, high, low, vol)."""
        url = f"{self.BASE_URL_PUBLIC}/{pair}/ticker"
        try:
            response = requests.get(url, timeout=10)
            return response.json().get('ticker', {})
        except Exception as e:
            print(f"[ERROR] Gagal mengambil ticker: {e}")
            return None

    def _private_request(self, method, params=None):
        """Membuat request privat terotentikasi dengan HMAC-SHA512 Signature."""
        if not self.api_key or not self.secret_key:
            raise ValueError("API Key atau Secret Key belum dikonfigurasi di .env!")

        if params is None:
            params = {}

        params['method'] = method
        params['timestamp'] = int(time.time() * 1000)

        post_data = urllib.parse.urlencode(params)
        signature = hmac.new(self.secret_key, post_data.encode('utf-8'), hashlib.sha512).hexdigest()

        headers = {
            'Key': self.api_key,
            'Sign': signature,
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        try:
            response = requests.post(self.BASE_URL_PRIVATE, data=post_data, headers=headers, timeout=10)
            return response.json()
        except Exception as e:
            print(f"[ERROR] Private API Call Error ({method}): {e}")
            return None

    def get_info(self):
        """Mendapatkan saldo akun dan status akun."""
        return self._private_request('getInfo')

    def create_order(self, pair, order_type, price, amount_coin):
        """
        Membuat order Jual/Beli.
        order_type: 'buy' atau 'sell'
        """
        params = {
            'pair': pair,
            'type': order_type,
            'price': price,
            order_type: amount_coin
        }
        return self._private_request('trade', params)