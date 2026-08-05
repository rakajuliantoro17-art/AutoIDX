/**
==========================================================
AURA Trade OS
System Limits
Version : 0.1.0 Alpha
==========================================================
Global Trading & System Limits
==========================================================
*/


/*
==========================================================
Trading
==========================================================
*/

export const MIN_CONFIDENCE = 70;

export const MAX_CONFIDENCE = 100;

export const MIN_ORDER_VALUE = 10000;

export const MAX_ORDER_VALUE = 100000000;

export const MAX_OPEN_POSITIONS = 10;

export const MAX_POSITION_PERCENT = 20;

export const MAX_EXPOSURE_PERCENT = 50;





/*
==========================================================
Risk Management
==========================================================
*/

export const MAX_DAILY_LOSS_PERCENT = 5;

export const MAX_TOTAL_DRAWDOWN_PERCENT = 20;

export const MAX_CONSECUTIVE_LOSSES = 5;

export const MAX_SINGLE_TRADE_LOSS_PERCENT = 2;

export const MAX_LEVERAGE = 1;





/*
==========================================================
Execution
==========================================================
*/

export const MAX_RETRY = 3;

export const MAX_SLIPPAGE_PERCENT = 0.5;

export const MAX_ORDER_TIMEOUT_SECONDS = 30;





/*
==========================================================
Market
==========================================================
*/

export const MAX_CANDLE_HISTORY = 5000;

export const MAX_ORDERBOOK_DEPTH = 100;

export const MAX_TICK_CACHE = 10000;





/*
==========================================================
Indicators
==========================================================
*/

export const MAX_INDICATOR_PERIOD = 500;

export const MIN_INDICATOR_PERIOD = 2;





/*
==========================================================
Backtest
==========================================================
*/

export const MAX_BACKTEST_CANDLES = 100000;

export const MAX_BACKTEST_TRADES = 50000;





/*
==========================================================
Paper Trading
==========================================================
*/

export const DEFAULT_PAPER_BALANCE = 100000000;

export const MAX_PAPER_ORDERS = 10000;





/*
==========================================================
Live Trading
==========================================================
*/

export const MAX_LIVE_ORDER_QUEUE = 100;

export const MAX_PENDING_ORDERS = 20;





/*
==========================================================
Monitoring
==========================================================
*/

export const MAX_HEARTBEAT_MISSED = 3;

export const MAX_ERROR_COUNT = 10;





/*
==========================================================
Logging
==========================================================
*/

export const MAX_LOG_FILE_SIZE_MB = 50;

export const MAX_LOG_RETENTION_DAYS = 30;





/*
==========================================================
API
==========================================================
*/

export const MAX_REQUESTS_PER_MINUTE = 120;

export const MAX_PARALLEL_REQUESTS = 10;





/*
==========================================================
Portfolio
==========================================================
*/

export const MAX_PORTFOLIO_ASSETS = 100;

export const MAX_WATCHLIST_SIZE = 200;
```

