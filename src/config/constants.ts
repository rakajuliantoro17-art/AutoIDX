/**
==========================================================
AURA Trade OS
Global Constants
Version : 0.1.0 Alpha
==========================================================
Shared Global Constants
==========================================================
*/


/*
==========================================================
Application
==========================================================
*/

export const APP_NAME = "AURA Trade OS";

export const APP_VERSION = "0.1.0 Alpha";

export const APP_AUTHOR = "Raka Aditya Juliantoro";

export const APP_LICENSE = "MIT";





/*
==========================================================
Time
==========================================================
*/

export const SECOND = 1000;

export const MINUTE = 60 * SECOND;

export const HOUR = 60 * MINUTE;

export const DAY = 24 * HOUR;





/*
==========================================================
Trading
==========================================================
*/

export const BUY = "BUY";

export const SELL = "SELL";

export const HOLD = "HOLD";





/*
==========================================================
Order
==========================================================
*/

export const MARKET_ORDER = "MARKET";

export const LIMIT_ORDER = "LIMIT";

export const STOP_ORDER = "STOP";

export const TAKE_PROFIT_ORDER = "TAKE_PROFIT";





/*
==========================================================
Engine Status
==========================================================
*/

export const ENGINE_STOPPED = "STOPPED";

export const ENGINE_STARTING = "STARTING";

export const ENGINE_RUNNING = "RUNNING";

export const ENGINE_PAUSED = "PAUSED";

export const ENGINE_ERROR = "ERROR";





/*
==========================================================
Health Status
==========================================================
*/

export const HEALTHY = "HEALTHY";

export const WARNING = "WARNING";

export const CRITICAL = "CRITICAL";

export const OFFLINE = "OFFLINE";





/*
==========================================================
Heartbeat
==========================================================
*/

export const HEARTBEAT_ALIVE = "ALIVE";

export const HEARTBEAT_STALE = "STALE";

export const HEARTBEAT_DEAD = "DEAD";





/*
==========================================================
Order Status
==========================================================
*/

export const ORDER_PENDING = "PENDING";

export const ORDER_OPEN = "OPEN";

export const ORDER_PARTIALLY_FILLED = "PARTIALLY_FILLED";

export const ORDER_FILLED = "FILLED";

export const ORDER_CANCELLED = "CANCELLED";

export const ORDER_REJECTED = "REJECTED";





/*
==========================================================
Position
==========================================================
*/

export const LONG = "LONG";

export const SHORT = "SHORT";





/*
==========================================================
Logging
==========================================================
*/

export const LOG_DEBUG = "debug";

export const LOG_INFO = "info";

export const LOG_WARN = "warn";

export const LOG_ERROR = "error";





/*
==========================================================
HTTP
==========================================================
*/

export const HTTP_OK = 200;

export const HTTP_CREATED = 201;

export const HTTP_BAD_REQUEST = 400;

export const HTTP_UNAUTHORIZED = 401;

export const HTTP_FORBIDDEN = 403;

export const HTTP_NOT_FOUND = 404;

export const HTTP_TOO_MANY_REQUESTS = 429;

export const HTTP_INTERNAL_SERVER_ERROR = 500;





/*
==========================================================
Retry
==========================================================
*/

export const DEFAULT_MAX_RETRY = 3;

export const DEFAULT_RETRY_DELAY = 2 * SECOND;





/*
==========================================================
Timeout
==========================================================
*/

export const API_TIMEOUT = 15 * SECOND;

export const WEBSOCKET_RECONNECT_DELAY = 5 * SECOND;

export const HEALTH_CHECK_INTERVAL = 30 * SECOND;

export const HEARTBEAT_INTERVAL = 5 * SECOND;





/*
==========================================================
Pagination
==========================================================
*/

export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;





/*
==========================================================
Precision
==========================================================
*/

export const PRICE_DECIMALS = 8;

export const QUANTITY_DECIMALS = 8;

export const PERCENT_DECIMALS = 2;





/*
==========================================================
Misc
==========================================================
*/

export const EMPTY_STRING = "";

export const UNKNOWN = "UNKNOWN";

export const DEFAULT_TIMEZONE = "Asia/Jakarta";
```

