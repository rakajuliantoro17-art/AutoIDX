/**
==========================================================
AURA Trade OS
Backoff Strategy
Version : 0.0.8 Alpha
==========================================================
*/

export enum BackoffStrategy {
    NONE = "NONE",
    FIXED = "FIXED",
    LINEAR = "LINEAR",
    EXPONENTIAL = "EXPONENTIAL",
    EXPONENTIAL_JITTER =
        "EXPONENTIAL_JITTER",
}
